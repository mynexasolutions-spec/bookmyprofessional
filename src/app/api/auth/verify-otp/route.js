import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { email, type, otp } = await req.json();

    if (!email || !type || !otp) {
      return NextResponse.json({ error: 'Email, type, and otp are required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const key = `otp_${type}_${email.toLowerCase()}`;
    
    const { data: record, error } = await supabase.from('settings').select('value').eq('key', key).single();
    
    if (error || !record || !record.value) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const { code, expiresAt } = record.value;

    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (code !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP' }, { status: 400 });
    }

    // OTP is valid. Delete it so it can't be reused.
    await supabase.from('settings').delete().eq('key', key);

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
