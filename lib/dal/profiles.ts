import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { getUser } from './auth';
import type { UserProfile, UserRoleName } from '@/types/database';

export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;

  // Bypass DB if dummy user
  if (user.id === 'dummy-user-id') {
    const email = user.email || 'dummy@example.com';
    let role: UserRoleName = 'citizen';
    if (email.includes('admin')) role = 'admin';
    else if (email.includes('driver')) role = 'driver';
    else if (email.includes('supervisor')) role = 'supervisor';

    return {
      id: user.id,
      organization_id: 'dummy-org-id',
      full_name: role === 'admin' ? 'System Administrator' : role === 'driver' ? 'Test Driver' : 'Test Citizen',
      phone: '+255 700 000000',
      email: email,
      avatar_url: null,
      status: 'active',
      roles: [role],
      primaryRole: role,
    } as UserProfile;
  }

  const supabase = await createServerSupabaseClient();
  
  // Phase 3: Optimize Server Components
  // Move independent queries into Promise.all()
  const [profileRes, rolesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_roles').select('roles(name)').eq('profile_id', user.id).is('deleted_at', null)
  ]);

  if (profileRes.error) return null;

  const rolesData = rolesRes.data ?? [];
  const roles = rolesData.map((r: any) => ((r.roles as any)?.name ?? 'citizen') as UserRoleName);

  let primaryRole: UserRoleName = 'citizen';
  if (roles.includes('admin')) primaryRole = 'admin';
  else if (roles.includes('supervisor')) primaryRole = 'supervisor';
  else if (roles.includes('driver')) primaryRole = 'driver';

  return {
    ...profileRes.data,
    roles,
    primaryRole
  } as UserProfile;
});
