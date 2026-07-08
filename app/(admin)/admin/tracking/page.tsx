'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { Truck, MapPin, RefreshCw } from 'lucide-react';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export default function AdminTrackingPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createBrowserSupabaseClient();
  const orgId = profile?.organization_id;

  // Query Fleet vehicles list from database
  const { data: fleetList = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-fleet', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, plate_number, model, status, assigned_driver_id, vehicle_current_location(*), drivers(profiles(full_name))')
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  // Realtime subscription for vehicle_current_location updates
  useEffect(() => {
    if (!orgId) return;

    const channel = supabase
      .channel('live-fleet-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_current_location',
        },
        () => {
          // Re-fetch vehicle details to get updated locations
          queryClient.invalidateQueries({ queryKey: ['admin-fleet', orgId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="tracking" setActiveTab={(tab) => router.push(`/admin/${tab === 'dashboard' ? '' : tab}`)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {isLoading ? (
            <SkeletonDashboard />
          ) : error ? (
            <ErrorDisplay error={error as Error} onRetry={refetch} />
          ) : (
            <div className="flex flex-col gap-6 p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-text-primary">Live GPS Fleet Tracking</h1>
                  <p className="text-xs text-text-secondary">Realtime telemetry maps and tracking coordinate stream</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-fleet', orgId] }); toast.info('Refreshed', 'GPS tracking telemetry synced.'); }}>
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Sync
                </Button>
              </div>

              {/* Map Preview */}
              <div className="w-full h-80 bg-[#eef4fd] rounded-xl flex items-center justify-center border border-outline/10 shadow-inner relative overflow-hidden">
                <div className="text-center z-10">
                  <Truck className="h-12 w-12 mx-auto text-primary animate-bounce" />
                  <p className="text-xs font-bold text-text-primary mt-2">Active Municipal Dispatch Telemetry</p>
                  <p className="text-[10px] text-text-secondary">Tracking {fleetList.length} registered vehicles</p>
                </div>

                {fleetList.map((vehicle: any, idx: number) => {
                  const loc = vehicle.vehicle_current_location?.[0];
                  if (!loc) return null;

                  const topPos = 25 + (idx * 15) % 50;
                  const leftPos = 20 + (idx * 20) % 60;

                  return (
                    <div
                      key={vehicle.id}
                      style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                      className="absolute bg-white px-2 py-1 rounded shadow-md text-[9px] font-bold z-20 border border-outline/10 flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      {vehicle.drivers?.profiles?.full_name || 'Driver'} ({vehicle.plate_number})
                    </div>
                  );
                })}
              </div>

              {/* Fleet List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fleetList.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-xs text-text-secondary">No vehicles registered in fleet.</div>
                ) : (
                  fleetList.map((vehicle: any) => {
                    const loc = vehicle.vehicle_current_location?.[0];
                    return (
                      <Card key={vehicle.id}>
                        <CardContent className="p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm font-mono">{vehicle.plate_number}</span>
                            <Badge variant={vehicle.status === 'active' ? 'success' : 'danger'}>
                              {vehicle.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary">
                            Driver: {vehicle.drivers?.profiles?.full_name || 'Unassigned'} · Model: {vehicle.model}
                          </p>
                          {loc ? (
                            <p className="text-[10px] text-primary mt-1 font-mono flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              GPS: {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                            </p>
                          ) : (
                            <p className="text-[10px] text-text-secondary mt-1 font-mono">GPS Signal Offline</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
