import { DriverInteractiveDashboard } from '@/components/dashboard/driver-interactive-dashboard';
import { requireUser } from '@/lib/dal/auth';
import { getProfile } from '@/lib/dal/profiles';
import { getDriverDashboard } from '@/lib/dal/dashboard';

export default async function DriverHomePage() {
  // 1. Get User (Redirects if not found)
  const user = await requireUser();

  // 2. Concurrently fetch Profile and Dashboard Data
  // Phase 3: Promise.all optimization
  const [profile, dashboardData] = await Promise.all([
    getProfile(),
    getDriverDashboard(user.id),
  ]);

  return (
    <DriverInteractiveDashboard 
      user={user} 
      profile={profile} 
      initialData={dashboardData} 
    />
  );
}
