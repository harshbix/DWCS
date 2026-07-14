import { AdminInteractiveDashboard } from '@/components/dashboard/admin-interactive-dashboard';
import { requireUser } from '@/lib/dal/auth';
import { getProfile } from '@/lib/dal/profiles';
import { getAdminDashboard } from '@/lib/dal/dashboard';

export default async function AdminHomePage() {
  // 1. Get User
  const user = await requireUser();

  // 2. Get Profile
  const profile = await getProfile();

  // 3. Get Initial Dashboard Data
  let dashboardData = null;
  if (profile?.organization_id) {
    dashboardData = await getAdminDashboard(profile.organization_id);
  }

  return (
    <AdminInteractiveDashboard 
      user={user} 
      profile={profile} 
      initialData={dashboardData} 
    />
  );
}
