'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { useMutation } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import { Navigation, Truck, MapPin } from 'lucide-react';

export default function DriverTrackingPage() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useDriverDashboard(user?.id);
  const supabase = createBrowserSupabaseClient();
  const [broadcasting, setBroadcasting] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);

  const assignedVehicle = dashboardData?.assigned_vehicle;

  const updateLocation = useMutation({
    mutationFn: async (payload: { vehicleId: string; lat: number; lng: number }) => {
      const { error } = await supabase.from('vehicle_current_location').upsert({
        vehicle_id: payload.vehicleId,
        latitude: payload.lat,
        longitude: payload.lng,
        recorded_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => setLastCoords({ lat: vars.lat, lng: vars.lng }),
  });

  useEffect(() => {
    if (!broadcasting || !assignedVehicle?.id) return;

    const sendPing = () => {
      const lat = -8.9000 + (Math.random() - 0.5) * 0.005;
      const lng = 33.4500 + (Math.random() - 0.5) * 0.005;
      updateLocation.mutate({ vehicleId: assignedVehicle.id, lat, lng });
    };

    sendPing();
    const interval = setInterval(sendPing, 15000);
    return () => clearInterval(interval);
  }, [broadcasting, assignedVehicle?.id]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {isLoading ? (
          <SkeletonDashboard />
        ) : error ? (
          <ErrorDisplay error={error as Error} onRetry={refetch} />
        ) : (
          <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-lg mx-auto">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Live Tracking</h1>
              <p className="text-xs text-text-secondary mt-0.5">Broadcast your location to dispatch and residents</p>
            </div>

            {!assignedVehicle ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center p-6">
                <Truck className="h-10 w-10 text-outline" />
                <p className="text-sm font-semibold text-text-primary">No vehicle assigned</p>
                <p className="text-xs text-text-secondary">GPS tracking requires a vehicle assignment.</p>
              </div>
            ) : (
              <>
                <Card>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary">Assigned Vehicle</p>
                      <h3 className="text-lg font-bold text-text-primary mt-0.5">{assignedVehicle.plate_number}</h3>
                      <p className="text-xs text-text-secondary">{assignedVehicle.model}</p>
                    </div>
                    <Badge variant={assignedVehicle.status === 'active' ? 'success' : 'warning'}>
                      {assignedVehicle.status}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Simulated Map View */}
                <div className="w-full h-52 bg-[#eef4fd] rounded-xl border border-outline/10 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10">
                    <Truck className={`h-10 w-10 mx-auto text-primary ${broadcasting ? 'animate-bounce' : ''}`} />
                    {lastCoords ? (
                      <p className="text-xs font-mono text-text-primary mt-2">
                        {lastCoords.lat.toFixed(4)}, {lastCoords.lng.toFixed(4)}
                      </p>
                    ) : (
                      <p className="text-xs text-text-secondary mt-2">
                        {broadcasting ? 'Acquiring GPS...' : 'GPS offline'}
                      </p>
                    )}
                  </div>
                  {broadcasting && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary text-white px-2 py-1 rounded-full text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>

                <Button
                  variant={broadcasting ? 'default' : 'outline'}
                  onClick={() => {
                    setBroadcasting(!broadcasting);
                    toast.info(
                      broadcasting ? 'GPS Stopped' : 'GPS Started',
                      broadcasting ? 'Location broadcast halted.' : 'Broadcasting to dispatch every 15s.'
                    );
                  }}
                  className="w-full"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {broadcasting ? 'Stop Broadcasting' : 'Start GPS Broadcast'}
                </Button>

                {broadcasting && (
                  <p className="text-[10px] text-text-secondary text-center bg-primary/5 p-3 rounded-lg">
                    <MapPin className="h-3 w-3 inline mr-1 text-primary" />
                    Location updating every 15 seconds. Keep the screen active.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <MobileBottomNav role="driver" />
    </div>
  );
}
