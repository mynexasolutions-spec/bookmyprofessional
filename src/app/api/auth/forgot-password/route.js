import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendEmailViaBrevo } from '@/lib/brevo';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const key = `reset_${email.toLowerCase()}`;
    
    const { data: existing } = await supabase.from('settings').select('key').eq('key', key).single();
    
    if (existing) {
      await supabase.from('settings').update({ value: { token, expiresAt } }).eq('key', key);
    } else {
      await supabase.from('settings').insert({ key, value: { token, expiresAt } });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetLink = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const subject = "Password Reset Request";
    const htmlContent = `<div style="font-family: sans-serif; padding: 20px;">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to choose a new password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Reset Password</a>
      <p>If you did not request this, please ignore this email. The link will expire in 15 minutes.</p>
    </div>`;

    await sendEmailViaBrevo({
      toEmail: email,
      subject,
      htmlContent,
    });

    return NextResponse.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Failed to process forgot password request' }, { status: 500 });
  }
}
