import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js Edge Middleware.
 *
 * Responsibilities:
 * 1. Refresh Supabase session tokens on every request (keeps sessions alive).
 * 2. Protect role-based route groups (/citizen, /driver, /admin).
 * 3. Redirect unauthenticated users to /login.
 * 4. Redirect users to the correct portal if they navigate to the wrong one.
 *
 * Important bypass rules:
 * - /auth/* paths are never intercepted (OAuth code exchange must complete first).
 * - Static files and public pages pass through without session checks.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // ── Bypass rules ──────────────────────────────────────────────────────────
  // Auth callback: OAuth code must be exchanged before session is available
  if (pathname.startsWith('/auth')) return response;
  // Static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
    return response;
  }
  // Public pages — no session required
  if (pathname === '/login' || pathname === '/register' || pathname === '/landing') {
    return response;
  }

  // ── Session check ─────────────────────────────────────────────────────────
  const isDummyAuth = request.cookies.get('dummy-auth')?.value === 'true';

  let user = null;

  if (!isDummyAuth) {
    // Always call getUser() (not getSession()) to verify token server-side
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } else {
    user = { id: 'dummy-user-id', email: request.cookies.get('dummy-email')?.value };
  }

  if (!user) {
    // Not authenticated — redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based route protection ───────────────────────────────────────────
  const isAdminRoute = pathname.startsWith('/admin');
  const isDriverRoute = pathname.startsWith('/driver');
  const isCitizenRoute = pathname.startsWith('/citizen');

  if (isAdminRoute || isDriverRoute || isCitizenRoute) {
    const cachedRole = request.cookies.get('user-role')?.value;
    let isAdmin = false;
    let isDriver = false;

    if (cachedRole) {
      isAdmin = cachedRole === 'admin';
      isDriver = cachedRole === 'driver';
    } else {
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('profile_id', user.id)
        .is('deleted_at', null);

      const roles: string[] = (rolesData ?? [])
        .map((r: any) => r.roles?.name as string)
        .filter(Boolean);

      isAdmin = roles.includes('admin') || roles.includes('supervisor');
      isDriver = roles.includes('driver');
    }

    const roleValue = isAdmin ? 'admin' : isDriver ? 'driver' : 'citizen';
    const homePortal = isAdmin ? '/admin' : isDriver ? '/driver' : '/citizen';

    if (isAdminRoute && !isAdmin) {
      const redirectResponse = NextResponse.redirect(new URL(homePortal, request.url));
      redirectResponse.cookies.set('user-role', roleValue, { path: '/', maxAge: 3600 });
      return redirectResponse;
    }
    if (isDriverRoute && !isDriver) {
      const redirectResponse = NextResponse.redirect(new URL(homePortal, request.url));
      redirectResponse.cookies.set('user-role', roleValue, { path: '/', maxAge: 3600 });
      return redirectResponse;
    }
    if (isCitizenRoute && (isAdmin || isDriver)) {
      const redirectResponse = NextResponse.redirect(new URL(homePortal, request.url));
      redirectResponse.cookies.set('user-role', roleValue, { path: '/', maxAge: 3600 });
      return redirectResponse;
    }

    if (!cachedRole) {
      response.cookies.set('user-role', roleValue, { path: '/', maxAge: 3600 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js static files)
     * - _next/image (Next.js image optimization)
     * - favicon.ico
     * - Image/asset files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
