import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmailViaBrevo } from '@/lib/brevo';

export async function POST(req) {
  try {
    const { email, type } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in settings table as a workaround for storing temporary OTPs
    const key = `otp_${type}_${email.toLowerCase()}`;
    
    // Check if row exists
    const { data: existing } = await supabase.from('settings').select('key').eq('key', key).single();
    
    if (existing) {
      await supabase.from('settings').update({ value: { code: otp, expiresAt } }).eq('key', key);
    } else {
      // Create new row
      await supabase.from('settings').insert({ key, value: { code: otp, expiresAt } });
    }

    // Send email via Brevo
    let subject = "Your Verification Code";
    let htmlContent = `<div style="font-family: sans-serif; padding: 20px;">
      <h2>Verification Code</h2>
      <p>Your one-time verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #0284c7;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    </div>`;

    if (type === 'reset') {
      subject = "Password Reset Request";
    } else if (type === 'signup') {
      subject = "Welcome to BookMyProfessional - Verify your email";
    }

    await sendEmailViaBrevo({
      toEmail: email,
      subject,
      htmlContent,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
