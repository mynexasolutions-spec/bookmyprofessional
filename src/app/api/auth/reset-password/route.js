import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const key = `reset_${String(email).trim().toLowerCase()}`;
    const { data: record, error } = await supabase.from('settings').select('value').eq('key', key).single();
    
    if (error || !record || !record.value) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const { token: savedToken, expiresAt } = record.value;

    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
    }

    if (token !== savedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Token is valid. Look the account up by email (paged listUsers can miss users beyond page 1).
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', String(email).trim())
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Delete token so it can't be reused
    await supabase.from('settings').delete().eq('key', key);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
