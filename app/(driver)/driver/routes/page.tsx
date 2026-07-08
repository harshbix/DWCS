'use client';

import React, { useState } from 'react';
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
import { MapPin, Play, CheckCircle2 } from 'lucide-react';
import type { ScheduleStatus } from '@/types/database';

export default function DriverRoutesPage() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useDriverDashboard(user?.id);
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const activeSchedules = dashboardData?.active_schedules ?? [];

  const completeCollection = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase.rpc('v1_complete_collection', {
        p_schedule_id: scheduleId,
        p_actual_arrival: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Stop Completed', 'Collection logged and recorded.');
      queryClient.invalidateQueries({ queryKey: ['driver-dashboard'] });
      setActiveStopId(null);
    },
    onError: (err: Error) => toast.error('Action Failed', err.message),
  });

  const statusVariant = (status: ScheduleStatus) => {
    if (status === 'completed') return 'success';
    if (status === 'missed') return 'danger';
    return 'outline';
  };

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
              <h1 className="text-xl font-bold text-text-primary">Route Stops</h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {activeSchedules.filter(s => s.status === 'completed').length}/{activeSchedules.length} stops completed
              </p>
            </div>

            {activeSchedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center p-6">
                <MapPin className="h-10 w-10 text-outline" />
                <p className="text-sm font-semibold text-text-primary">No stops assigned</p>
                <p className="text-xs text-text-secondary">Your route will appear here when scheduled.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeSchedules.map((schedule) => (
                  <div
                    key={schedule.schedule_id}
                    onClick={() => schedule.status === 'scheduled' && setActiveStopId(
                      activeStopId === schedule.schedule_id ? null : schedule.schedule_id
                    )}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      activeStopId === schedule.schedule_id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-outline/10 bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{schedule.stop_name}</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5">
                          {schedule.route_name} · {schedule.expected_arrival}
                        </p>
                      </div>
                      <Badge variant={statusVariant(schedule.status)}>{schedule.status}</Badge>
                    </div>

                    {activeStopId === schedule.schedule_id && schedule.status === 'scheduled' && (
                      <div className="mt-3 pt-3 border-t border-outline/10">
                        <Button
                          onClick={(e) => { e.stopPropagation(); completeCollection.mutate(schedule.schedule_id); }}
                          isLoading={completeCollection.isPending}
                          className="w-full h-9 text-xs"
                        >
                          <Play className="h-4 w-4 mr-1.5" /> Log Collection Complete
                        </Button>
                      </div>
                    )}

                    {schedule.status === 'completed' && (
                      <div className="mt-2 flex items-center gap-1.5 text-primary text-[10px] font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <MobileBottomNav role="driver" />
    </div>
  );
}
