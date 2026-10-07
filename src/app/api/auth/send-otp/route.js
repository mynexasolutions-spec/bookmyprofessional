import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmailViaBrevo } from '@/lib/brevo';
import { recordEmailLog } from '@/lib/data/email-logs';

const COOLDOWN_SECONDS = 60; // 60s cooldown between OTP resends
const MAX_ATTEMPTS = 5; // Max 5 requests
const WINDOW_MS = 15 * 60 * 1000; // 15-minute rate limit window

export async function POST(req) {
  try {
    const { email: rawEmail, type } = await req.json();
    const email = String(rawEmail || '').toLowerCase().trim();

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const now = Date.now();
    const key = `otp_${type}_${email}`;

    // Check existing OTP record for rate-limiting and cooldown
    const { data: existingRecord } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (existingRecord?.value) {
      const { lastSentAt, windowStart = lastSentAt, requestCount = 1 } = existingRecord.value;

      // 1. Resend cooldown check
      if (lastSentAt && now - lastSentAt < COOLDOWN_SECONDS * 1000) {
        const remainingSeconds = Math.ceil((lastSentAt + COOLDOWN_SECONDS * 1000 - now) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${remainingSeconds}s before requesting a new code.`,
            remainingSeconds,
          },
          { status: 429 }
        );
      }

      // 2. Window rate limit check (max 5 per 15 mins)
      if (windowStart && now - windowStart < WINDOW_MS) {
        if (requestCount >= MAX_ATTEMPTS) {
          return NextResponse.json(
            { error: 'Too many OTP requests for this email. Please try again after 15 minutes.' },
            { status: 429 }
          );
        }
      }
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

    const currentCount =
      existingRecord?.value?.windowStart && now - existingRecord.value.windowStart < WINDOW_MS
        ? (existingRecord.value.requestCount || 1) + 1
        : 1;
    const currentWindowStart =
      existingRecord?.value?.windowStart && now - existingRecord.value.windowStart < WINDOW_MS
        ? existingRecord.value.windowStart
        : now;

    const otpData = {
      code: otp,
      expiresAt,
      lastSentAt: now,
      windowStart: currentWindowStart,
      requestCount: currentCount,
    };

    // Store in settings table
    if (existingRecord) {
      await supabase.from('settings').update({ value: otpData }).eq('key', key);
    } else {
      await supabase.from('settings').insert({ key, value: otpData });
    }

    // Prepare email content
    let subject = "Your Verification Code";
    if (type === 'reset') {
      subject = "Password Reset Code - BookMyProfessional";
    } else if (type === 'signup') {
      subject = "Welcome to BookMyProfessional - Verify your email";
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px;">Verification Code</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Use the 6-digit code below to complete your verification.</p>
        </div>
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">This code is valid for <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8;">
          BookMyProfessional • Verified Marketplace
        </div>
      </div>
    `;

    // Send email via Brevo
    let brevoRes = null;
    try {
      brevoRes = await sendEmailViaBrevo({
        toEmail: email,
        subject,
        htmlContent,
      });

      // Record successful send log for admin audit
      await recordEmailLog({
        messageId: brevoRes?.messageId,
        recipient: email,
        type: type === 'reset' ? 'Password Reset OTP' : 'Signup Verification OTP',
        subject,
        status: 'sent',
        metadata: { simulated: Boolean(brevoRes?.simulated) },
      });
    } catch (sendErr) {
      console.error('Brevo Send Error:', sendErr);
      // Record failed send log for admin audit
      await recordEmailLog({
        messageId: null,
        recipient: email,
        type: type === 'reset' ? 'Password Reset OTP' : 'Signup Verification OTP',
        subject,
        status: 'failed',
        errorMessage: sendErr?.message || 'Brevo dispatch failed',
      });
      throw sendErr;
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      cooldown: COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
