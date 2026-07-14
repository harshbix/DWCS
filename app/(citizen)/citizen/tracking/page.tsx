import { requireUser } from '@/lib/dal/auth';
import { TrackingMapPage } from '@/components/tracking/tracking-map-page';
import { MapProvider } from '@/components/map/map-provider';

export const metadata = { title: 'Live Tracking | EcoCollect' };

export default async function CitizenTrackingPage() {
  await requireUser();
  return (
    <MapProvider>
      <TrackingMapPage />
    </MapProvider>
  );
}
