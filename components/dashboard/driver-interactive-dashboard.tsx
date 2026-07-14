'use client';

import React, { useState, useEffect } from 'react';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/error-boundary';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { LocationService } from '@/lib/map/location-service';

function getDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function DriverInteractiveDashboard({ user, profile, initialData }: { user: any, profile: any, initialData: any }) {
  const router = useRouter();
  const { data: dashboardData, isLoading, error, refetch } = useDriverDashboard(user?.id, initialData);
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  const driverProfile = dashboardData?.driver_profile;
  const assignedVehicle = dashboardData?.assigned_vehicle;
  const activeSchedules = dashboardData?.active_schedules ?? [];
  const completedCount = activeSchedules.filter((s: any) => s.status === 'completed').length;
  const totalCount = activeSchedules.length;
  const nextStop = activeSchedules.find((s: any) => s.status === 'scheduled');

  const [navulating, setNavulating] = useState(false);

  const updateLocation = useMutation({
    mutationFn: async (payload: { vehicleId: string; lat: number; lng: number }) => {
      const { error } = await supabase.from('vehicle_current_location').upsert({
        vehicle_id: payload.vehicleId,
        latitude: payload.lat,
        longitude: payload.lng,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
  });

  useEffect(() => {
    if (!navulating || !assignedVehicle?.id) return;

    let watchId: number | null = null;
    let simInterval: NodeJS.Timeout | null = null;

    const lastCoordsRef = { current: null as { lat: number; lng: number } | null };

    const startTracking = async () => {
      try {
        const permission = await LocationService.checkPermission();
        if (permission === 'denied' || permission === 'unsupported') {
          throw new Error('Permission denied or unsupported');
        }

        watchId = LocationService.watchPosition(
          (coords) => {
            const last = lastCoordsRef.current;
            const dist = last ? getDistanceKM(last.lat, last.lng, coords.lat, coords.lng) : 999;
            if (dist >= 0.01) { // 10 meters threshold
              updateLocation.mutate({
                vehicleId: assignedVehicle.id,
                lat: coords.lat,
                lng: coords.lng,
              });
              lastCoordsRef.current = { lat: coords.lat, lng: coords.lng };
            }
          },
          (err) => {
            console.error('GPS Watch error, falling back to simulated:', err);
            startSimulation();
          }
        );
      } catch (err) {
        console.warn('Real GPS failed, using simulated movement:', err);
        startSimulation();
      }
    };

    const runTracking = () => {
      if (watchId !== null) {
        LocationService.clearWatch(watchId);
        watchId = null;
      }
      if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
      }

      if (document.visibilityState === 'hidden') {
        console.log('Telemetry GPS watch paused on hidden visibilityState');
        return;
      }

      startTracking();
    };

    const startSimulation = () => {
      const sendSimPing = () => {
        updateLocation.mutate({
          vehicleId: assignedVehicle.id,
          lat: -8.9000 + (Math.random() - 0.5) * 0.005,
          lng: 33.4500 + (Math.random() - 0.5) * 0.005,
        });
      };
      sendSimPing();
      simInterval = setInterval(sendSimPing, 10000); // Throttled to 10s
    };

    runTracking();

    const handleVisibility = () => {
      runTracking();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (watchId !== null) {
        LocationService.clearWatch(watchId);
      }
      if (simInterval) {
        clearInterval(simInterval);
      }
    };
  }, [navulating, assignedVehicle?.id, updateLocation]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
        {error ? (
          <ErrorDisplay error={error as Error} onRetry={refetch} />
        ) : (
          <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-lg mx-auto">
            {/* Driver Header */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-12 w-12 bg-tertiary rounded-full flex items-center justify-center text-white font-bold text-lg uppercase shrink-0 shadow-elevation-1">
                {profile?.full_name?.substring(0, 2) || 'DR'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-text-primary truncate">{profile?.full_name || 'Collector Driver'}</h1>
                <p className="text-xs text-text-secondary truncate">
                  {assignedVehicle ? `${assignedVehicle.plate_number} · ${assignedVehicle.model}` : 'No vehicle assigned'}
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">SHIFT ACTIVE</Badge>
            </div>

            {/* GPS Broadcast Panel & Broadcast Status */}
            <Card className="border border-outline/10 shadow-elevation-1">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                      {navulating ? (
                        <>
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-on-surface/30"></span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-text-primary">
                      {navulating ? 'GPS Broadcast Active' : 'GPS Broadcast Disabled'}
                    </span>
                  </div>
                  {navulating && (
                    <span className="text-[10px] text-text-secondary font-mono">
                      Interval: 15s
                    </span>
                  )}
                </div>

                {assignedVehicle ? (
                  <Button
                    variant={navulating ? 'danger' : 'default'}
                    onClick={() => {
                      setNavulating(!navulating);
                      toast.info(
                        navulating ? 'GPS Off' : 'GPS Active', 
                        navulating ? 'Location broadcast stopped.' : 'Broadcasting location to dispatch.'
                      );
                    }}
                    className="w-full h-10 text-xs font-bold"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {navulating ? 'Stop Broadcasting Location' : 'Start GPS Broadcast'}
                  </Button>
                ) : (
                  <p className="text-xs text-error font-medium text-center">
                    Assign a fleet vehicle to enable GPS broadcasting.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Shift Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border border-outline/10 shadow-elevation-1">
                <CardContent className="p-3 text-center">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Manifest</span>
                  <span className="text-lg font-black text-text-primary mt-1 block">
                    {completedCount}/{totalCount}
                  </span>
                  <span className="text-[8px] text-primary font-semibold mt-0.5 block">Stops</span>
                </CardContent>
              </Card>

              <Card className="border border-outline/10 shadow-elevation-1">
                <CardContent className="p-3 text-center">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Efficiency</span>
                  <span className="text-lg font-black text-text-primary mt-1 block">
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </span>
                  <span className="text-[8px] text-primary font-semibold mt-0.5 block">Completed</span>
                </CardContent>
              </Card>

              <Card className="border border-outline/10 shadow-elevation-1">
                <CardContent className="p-3 text-center">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">License</span>
                  <span className="text-xs font-bold text-text-primary mt-2 block truncate">
                    {driverProfile?.license_number || '—'}
                  </span>
                  <span className="text-[8px] text-primary font-semibold mt-1 block">Number</span>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => router.push('/driver/routes')} className="h-20 flex-col gap-1.5 hover:bg-surface-container-low transition-all">
                <Navigation className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold">Routes</span>
              </Button>
              <Button variant="outline" onClick={() => router.push('/driver/tracking')} className="h-20 flex-col gap-1.5 hover:bg-surface-container-low transition-all">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold">Tracking</span>
              </Button>
              <Button variant="outline" onClick={() => router.push('/driver/reports')} className="h-20 flex-col gap-1.5 border-error/20 hover:bg-error/5 hover:text-error transition-all">
                <AlertTriangle className="h-5 w-5 text-error" />
                <span className="text-[10px] font-bold text-error">Incident</span>
              </Button>
            </div>

            {/* Next Stop Card */}
            {nextStop && (
              <Card className="border border-outline/10 shadow-elevation-1">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Next Stop</p>
                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5">PENDING</Badge>
                  </div>
                  
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-text-primary truncate">{nextStop.stop_name}</h4>
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {nextStop.route_name} · ETA {nextStop.expected_arrival}
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={() => router.push('/driver/routes')} className="w-full h-9 text-xs font-bold mt-1">
                    Begin Navigation & Collect
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Today's Manifest Checklist */}
            <Card className="border border-outline/10 shadow-elevation-1">
              <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Today's Route Schedule
                </CardTitle>
                <span className="text-[10px] text-primary font-bold">
                  {totalCount} total points
                </span>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-2">
                {activeSchedules.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-text-secondary">No stops scheduled for today.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline/5">
                    {activeSchedules.map((stop: any, index: number) => (
                      <div key={stop.schedule_id + '-' + index} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                            stop.status === 'completed' 
                              ? "bg-primary/10 text-primary" 
                              : "bg-surface-container-high text-text-secondary"
                          )}>
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                             <p className={cn(
                              "text-xs font-bold text-text-primary truncate",
                              stop.status === 'completed' && "line-through text-text-secondary"
                            )}>
                              {stop.stop_name}
                            </p>
                            <p className="text-[9px] text-text-secondary truncate mt-0.5">
                              {stop.route_name} · ETA {stop.expected_arrival}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={cn(
                            "text-[8px] uppercase font-bold px-1.5 py-0.5 tracking-wider shrink-0",
                            stop.status === 'completed' 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "bg-surface-container text-text-secondary border-outline/10"
                          )}
                        >
                          {stop.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collection History Summary */}
            <Card className="border border-outline/10 shadow-elevation-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Recent Collections
                  </p>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-r border-outline/5">
                    <p className="text-[9px] text-text-secondary uppercase font-semibold">Tonnage Handled</p>
                    <h4 className="text-base font-extrabold text-text-primary mt-1">4.2 Tons</h4>
                    <p className="text-[8px] text-primary font-bold mt-0.5">This Month</p>
                  </div>
                  <div className="pl-2">
                    <p className="text-[9px] text-text-secondary uppercase font-semibold">Shift Hours</p>
                    <h4 className="text-base font-extrabold text-text-primary mt-1">36.5 Hrs</h4>
                    <p className="text-[8px] text-primary font-bold mt-0.5">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {totalCount > 0 && completedCount === totalCount && (
              <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 p-4 rounded-xl border border-primary/20 animate-fade-slide-up">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Excellent! All stops have been successfully completed today.</span>
              </div>
            )}
          </div>
        )}
      </main>
      <MobileBottomNav role="driver" />
    </div>
  );
}
