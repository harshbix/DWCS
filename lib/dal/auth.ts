import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { redirect } from 'next/navigation';

export const getUser = cache(async () => {
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
