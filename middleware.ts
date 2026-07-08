import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js Middleware managing route authentication guards and role redirections.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Bypass paths (static assets, public pages, auth portals)
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return response;
  }

  // Verify and refresh session if expired (Only for protected routes)
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if user is not authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Route protection rules
  const isAdminRoute = pathname.startsWith('/admin') || pathname === '/admin';
  const isDriverRoute = pathname.startsWith('/driver') || pathname === '/driver';
  const isCitizenRoute = pathname.startsWith('/citizen') || pathname === '/citizen';

  if (isAdminRoute || isDriverRoute || isCitizenRoute) {
    // Fetch roles assigned to this profile
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('profile_id', user.id)
      .is('deleted_at', null);

    const roles: string[] = rolesData?.map((r: any) => r.roles?.name) || [];

    if (isAdminRoute && !roles.includes('admin') && !roles.includes('supervisor')) {
      // Redirect out of admin route group
      const target = roles.includes('driver') ? '/driver' : '/citizen';
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isDriverRoute && !roles.includes('driver')) {
      // Redirect out of driver route group
      const target = roles.includes('admin') || roles.includes('supervisor') ? '/admin' : '/citizen';
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isCitizenRoute && !roles.includes('citizen')) {
      // Redirect out of citizen route group
      const target = roles.includes('admin') || roles.includes('supervisor') ? '/admin' : '/driver';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/assets (e.g. svg, png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
