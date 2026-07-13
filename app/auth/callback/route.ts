import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * OAuth Callback Route Handler.
 * Exchanges the OAuth code for a session, fetches the user's role, and
 * redirects them to the appropriate portal. New users with no role yet
 * (race condition on DB trigger) are defaulted to the /citizen portal.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch user roles — may be empty for brand-new Google sign-ins
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('profile_id', user.id)
          .is('deleted_at', null);

        const roles = (rolesData ?? []).map((r: any) => r.roles?.name as string).filter(Boolean);

        // Route based on role; default new users without a role to /citizen
        if (roles.includes('admin') || roles.includes('supervisor')) {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (roles.includes('driver')) {
          return NextResponse.redirect(`${origin}/driver`);
        } else {
          // Covers: citizen role, empty roles (new Google users), or any unrecognized role
          return NextResponse.redirect(`${origin}/citizen`);
        }
      }

      // Session exchanged but no user object — go to root which will redirect
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // Code exchange failed — redirect to login with an error message
  return NextResponse.redirect(`${origin}/login?error=oauth_handshake_failed`);
}
