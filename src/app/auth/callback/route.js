import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const roleParam = searchParams.get('role');
  const nextParam = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=OAuthMissingCode`);
  }

  // 1. Check cookie fallback for target role
  let cookieRole = null;
  try {
    const cookieStore = await cookies();
    cookieRole = cookieStore.get('oauth_role')?.value;
  } catch {}

  // Request-level intent (what tab or role was selected)
  const requestedRole = roleParam || cookieRole || null;

  try {
    const cookieStore = await cookies();
    const cookiesToApply = [];

    // Server client that writes cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {}
              cookiesToApply.push({ name, value, options });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.session?.user) {
      console.error('OAuth exchange error:', error);
      return NextResponse.redirect(`${origin}/login?error=OAuthFailed`);
    }

    const authUser = data.session.user;
    const email = authUser.email?.toLowerCase().trim();
    const meta = authUser.user_metadata || {};

    let adminSupabase = null;
    try {
      adminSupabase = createAdminClient();
    } catch {
      adminSupabase = supabase;
    }

    // Determine the resolved role
    let resolvedRole = 'customer';

    if (email && adminSupabase) {
      // Check existing profile by ID first, then by email
      let existingProfile = null;
      const { data: byId } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (byId) {
        existingProfile = byId;
      } else {
        const { data: byEmail } = await adminSupabase
          .from('profiles')
          .select('*')
          .ilike('email', email)
          .maybeSingle();
        existingProfile = byEmail;
      }

      // Check if user also has a professional record in 'professionals' table
      const { data: existingProRecord } = await adminSupabase
        .from('professionals')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      // Priority logic:
      // 1. Explicitly selected "professional" in registration/login -> 'professional'
      // 2. Already an existing professional in DB -> KEEP 'professional' (never demote on login)
      // 3. Already has a row in professionals table -> KEEP 'professional'
      // 4. Otherwise use existingProfile role if present, or requestedRole, or fallback to 'customer'
      if (requestedRole === 'professional') {
        resolvedRole = 'professional';
      } else if (existingProfile?.role === 'professional' || existingProRecord) {
        resolvedRole = 'professional';
      } else if (requestedRole === 'customer') {
        resolvedRole = 'customer';
      } else if (existingProfile?.role) {
        resolvedRole = existingProfile.role;
      } else {
        resolvedRole = 'customer';
      }

      const fullName =
        existingProfile?.full_name ||
        meta.full_name ||
        meta.name ||
        email.split('@')[0];
      const avatarUrl =
        existingProfile?.avatar_url || meta.avatar_url || meta.picture || null;

      if (existingProfile) {
        if (existingProfile.id !== authUser.id) {
          // Consolidate data to current authUser.id
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

          // Upsert profile row under authUser.id preserving existing data
          await adminSupabase.from('profiles').upsert({
            id: authUser.id,
            email,
            full_name: fullName,
            role: resolvedRole,
            phone: existingProfile.phone || '',
            city: existingProfile.city || '',
            address: existingProfile.address || '',
            avatar_url: avatarUrl,
          });

          if (resolvedRole === 'professional') {
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
              role: resolvedRole,
            })
            .eq('id', authUser.id);
        }
      } else {
        // New Google user: create profile row
        await adminSupabase.from('profiles').upsert({
          id: authUser.id,
          email,
          full_name: fullName,
          role: resolvedRole,
          avatar_url: avatarUrl,
        });
      }

      // If user is a professional, guarantee that a row exists in professionals table
      if (resolvedRole === 'professional') {
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
          user_metadata: { ...meta, role: resolvedRole },
        });
      } catch {}
    }

    const defaultTarget = resolvedRole === 'professional' ? '/vendor' : '/dashboard';
    const destination = (nextParam && nextParam !== '/' && nextParam !== '/login' && nextParam !== '/register')
      ? nextParam
      : defaultTarget;
    const response = NextResponse.redirect(`${origin}${destination}`);

    // Apply Supabase session cookies onto the response
    cookiesToApply.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    // Note: oauth_role is preserved until client hydrate finishes

    return response;
  } catch (err) {
    console.error('OAuth callback handler error:', err);
    return NextResponse.redirect(`${origin}/login?error=OAuthFailed`);
  }
}
