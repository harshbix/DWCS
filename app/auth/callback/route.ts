import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * Server Route Handler executing OAuth code exchange and routing based on role mappings.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('profile_id', user.id)
          .is('deleted_at', null);

        const roles = (rolesData ?? []).map((r: any) => r.roles?.name) || [];

        if (roles.includes('admin') || roles.includes('supervisor')) {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (roles.includes('driver')) {
          return NextResponse.redirect(`${origin}/driver`);
        } else {
          return NextResponse.redirect(`${origin}/citizen`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login with error details if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=oauth_handshake_failed`);
}
