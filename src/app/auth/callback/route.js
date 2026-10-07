import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const roleParam = searchParams.get('role');
  const nextParam = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=OAuthMissingCode`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.session?.user) {
      console.error('OAuth exchange error:', error);
      return NextResponse.redirect(`${origin}/login?error=OAuthFailed`);
    }

    const authUser = data.session.user;
    const email = authUser.email?.toLowerCase().trim();
    const meta = authUser.user_metadata || {};

    let targetRole = roleParam || meta.role || 'customer';
    let adminSupabase = null;

    try {
      adminSupabase = createAdminClient();
    } catch {
      // Fallback to session client if admin key is unconfigured
      adminSupabase = supabase;
    }

    if (email && adminSupabase) {
      // 1. Link by verified email: Check if an account already exists with this email
      const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      const fullName =
        existingProfile?.full_name ||
        meta.full_name ||
        meta.name ||
        email.split('@')[0];
      const avatarUrl =
        existingProfile?.avatar_url || meta.avatar_url || meta.picture || null;

      if (existingProfile) {
        // If user explicitly chose a role tab during sign-in/up, honor it.
        // Otherwise retain existing role if already established.
        if (roleParam) {
          targetRole = roleParam;
        } else if (existingProfile.role) {
          targetRole = existingProfile.role;
        }

        if (existingProfile.id !== authUser.id) {
          // Email match on different ID (e.g. previously signed up via email/password):
          // Consolidate data to current authUser.id so the user never has two accounts.
          try {
            await adminSupabase
              .from('bookings')
              .update({ customer_id: authUser.id })
              .eq('customer_id', existingProfile.id);
          } catch {}

          try {
            await adminSupabase
              .from('bookings')
              .update({ professional_id: authUser.id })
              .eq('professional_id', existingProfile.id);
          } catch {}

          try {
            await adminSupabase
              .from('reviews')
              .update({ customer_id: authUser.id })
              .eq('customer_id', existingProfile.id);
          } catch {}

          try {
            await adminSupabase
              .from('wishlist')
              .update({ user_id: authUser.id })
              .eq('user_id', existingProfile.id);
          } catch {}

          // Upsert the profile row under authUser.id preserving existing phone/city
          await adminSupabase.from('profiles').upsert({
            id: authUser.id,
            email,
            full_name: fullName,
            role: targetRole,
            phone: existingProfile.phone || '',
            city: existingProfile.city || '',
            address: existingProfile.address || '',
            avatar_url: avatarUrl,
          });

          if (targetRole === 'professional') {
            try {
              await adminSupabase
                .from('professionals')
                .update({ id: authUser.id })
                .eq('id', existingProfile.id);
            } catch {}
          }
        } else {
          // Same ID: update avatar, name, and role
          await adminSupabase
            .from('profiles')
            .update({
              full_name: fullName,
              avatar_url: avatarUrl,
              role: targetRole,
            })
            .eq('id', authUser.id);
        }
      } else {
        // New Google user: create profile row
        await adminSupabase.from('profiles').upsert({
          id: authUser.id,
          email,
          full_name: fullName,
          role: targetRole,
          avatar_url: avatarUrl,
        });
      }

      // If user is a professional, guarantee that a row exists in professionals table
      if (targetRole === 'professional') {
        const { data: pro } = await adminSupabase
          .from('professionals')
          .select('id')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!pro) {
          await adminSupabase.from('professionals').insert({
            id: authUser.id,
            name: fullName,
            role_title: 'Professional',
            category: 'Doctors',
            city: existingProfile?.city || 'Mumbai',
            image_url: avatarUrl,
            verification_status: 'not_submitted',
            is_active: true,
          });
        }
      }

      // Sync role into auth user metadata
      try {
        await adminSupabase.auth.admin.updateUserById(authUser.id, {
          user_metadata: { ...meta, role: targetRole },
        });
      } catch {}
    }

    // Determine redirect destination
    if (nextParam) {
      return NextResponse.redirect(`${origin}${nextParam}`);
    }

    if (targetRole === 'professional') {
      return NextResponse.redirect(`${origin}/vendor`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    console.error('OAuth callback handler error:', err);
    return NextResponse.redirect(`${origin}/login?error=OAuthFailed`);
  }
}
