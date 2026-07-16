import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { redirect } from 'next/navigation';

import { cookies } from 'next/headers';

export const getUser = cache(async () => {
  const cookieStore = await cookies();
  const isDummyAuth = cookieStore.get('dummy-auth')?.value === 'true';
  const dummyEmail = cookieStore.get('dummy-email')?.value || 'dummy@example.com';

  if (isDummyAuth) {
    return { id: 'dummy-user-id', email: decodeURIComponent(dummyEmail) };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
});

export const requireUser = async () => {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
};
