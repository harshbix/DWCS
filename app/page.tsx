import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Root Server Redirector.
 *
 * Runs entirely on the server — no client-side JavaScript, no loading flash.
 * Reads the active Supabase session and immediately issues a 307 redirect to
 * the correct role-based portal. Unauthenticated users go straight to /login.
 */
export default async function RootPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's primary role from the database
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('profile_id', user.id)
    .is('deleted_at', null);

  const roles = (rolesData ?? []).map((r: any) => r.roles?.name as string).filter(Boolean);

  if (roles.includes('admin') || roles.includes('supervisor')) {
    redirect('/admin');
  } else if (roles.includes('driver')) {
    redirect('/driver');
  } else {
    // Default: citizen (handles new users with no role yet)
    redirect('/citizen');
  }
}
