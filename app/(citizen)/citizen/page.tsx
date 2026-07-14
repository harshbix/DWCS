import { CitizenHomeDashboard } from '@/components/dashboard/citizen-home-dashboard';
import { requireUser } from '@/lib/dal/auth';
import { getProfile } from '@/lib/dal/profiles';
import { getCitizenDashboard } from '@/lib/dal/dashboard';

export default async function CitizenHomePage() {
  const user = await requireUser();
  const [profile, dashboardData] = await Promise.all([
    getProfile(),
    getCitizenDashboard(user.id),
  ]);

  return (
    <CitizenHomeDashboard
      user={user}
      profile={profile}
      initialData={dashboardData}
    />
  );
}
