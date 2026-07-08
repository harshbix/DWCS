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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { Truck, Navigation, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useDriverDashboard(user?.id);
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  const driverProfile = dashboardData?.driver_profile;
  const assignedVehicle = dashboardData?.assigned_vehicle;
  const activeSchedules = dashboardData?.active_schedules ?? [];
  const completedCount = activeSchedules.filter((s) => s.status === 'completed').length;
  const totalCount = activeSchedules.length;
  const nextStop = activeSchedules.find((s) => s.status === 'scheduled');

  const [navulating, setNavulating] = useState(false);

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
  });

  useEffect(() => {
    if (!navulating || !assignedVehicle?.id) return;
    updateLocation.mutate({ vehicleId: assignedVehicle.id, lat: -6.7924 + (Math.random() - 0.5) * 0.005, lng: 39.2083 + (Math.random() - 0.5) * 0.005 });
    const interval = setInterval(() => {
      updateLocation.mutate({ vehicleId: assignedVehicle.id, lat: -6.7924 + (Math.random() - 0.5) * 0.005, lng: 39.2083 + (Math.random() - 0.5) * 0.005 });
    }, 15000);
    return () => clearInterval(interval);
  }, [navulating, assignedVehicle?.id]);

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
            {/* Driver Header */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-12 w-12 bg-tertiary rounded-full flex items-center justify-center text-white font-bold text-lg uppercase shrink-0">
                {profile?.full_name?.substring(0, 2) || 'DR'}
              </div>
              <div>
                <h1 className="text-base font-bold text-text-primary">{profile?.full_name || 'Collector Driver'}</h1>
                <p className="text-xs text-text-secondary">
                  {assignedVehicle ? `${assignedVehicle.plate_number} · ${assignedVehicle.model}` : 'No vehicle assigned'}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">SHIFT ACTIVE</Badge>
            </div>

            {/* Route Progress */}
            <Card className="bg-gradient-to-br from-primary-container to-primary text-white border-0">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-primary-container font-bold">Route Progress</p>
                  <h3 className="text-xl font-black mt-1">Today's Manifest</h3>
                  <p className="text-xs text-primary-container/80 mt-0.5">License: {driverProfile?.license_number || '—'}</p>
                </div>
                <div className="h-14 w-14 bg-white/10 rounded-full flex flex-col items-center justify-center border border-white/10">
                  <span className="text-xl font-black leading-none">{completedCount}</span>
                  <span className="text-[9px] opacity-75 font-semibold mt-0.5">/{totalCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* GPS Broadcast */}
            {assignedVehicle && (
              <Button
                variant={navulating ? 'default' : 'outline'}
                onClick={() => {
                  setNavulating(!navulating);
                  toast.info(navulating ? 'GPS Off' : 'GPS Active', navulating ? 'Location broadcast stopped.' : 'Broadcasting location to dispatch.');
                }}
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {navulating ? 'Broadcasting GPS — Tap to Stop' : 'Start GPS Broadcast'}
              </Button>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => router.push('/driver/routes')} className="h-20 flex-col gap-1.5">
                <Navigation className="h-5 w-5 text-primary" />
                <span className="text-[10px]">Routes</span>
              </Button>
              <Button variant="outline" onClick={() => router.push('/driver/tracking')} className="h-20 flex-col gap-1.5">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-[10px]">Tracking</span>
              </Button>
              <Button variant="outline" onClick={() => router.push('/driver/reports')} className="h-20 flex-col gap-1.5 border-error/20 hover:bg-error/5">
                <AlertTriangle className="h-5 w-5 text-error" />
                <span className="text-[10px] text-error">Incident</span>
              </Button>
            </div>

            {/* Next Stop */}
            {nextStop && (
              <Card>
                <CardContent className="p-4 flex flex-col gap-2">
                  <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Next Stop</p>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">{nextStop.stop_name}</h4>
                      <p className="text-[10px] text-text-secondary">{nextStop.route_name} · {nextStop.expected_arrival}</p>
                    </div>
                  </div>
                  <Button onClick={() => router.push('/driver/routes')} className="w-full h-8 text-xs">View Stop Operations</Button>
                </CardContent>
              </Card>
            )}

            {totalCount > 0 && completedCount === totalCount && (
              <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 p-4 rounded-xl">
                <CheckCircle2 className="h-5 w-5" />
                All stops completed for today!
              </div>
            )}
          </div>
        )}
      </main>
      <MobileBottomNav role="driver" />
    </div>
  );
}
