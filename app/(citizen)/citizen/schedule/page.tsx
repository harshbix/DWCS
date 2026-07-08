'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { formatDate } from '@/utils/format';
import { CalendarClock, Truck, MapPin } from 'lucide-react';

export default function CitizenSchedulePage() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useCitizenDashboard(user?.id);

  const nextSchedule = dashboardData?.next_schedule;

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
              <h1 className="text-xl font-bold text-text-primary">Collection Schedule</h1>
              <p className="text-xs text-text-secondary mt-0.5">Your upcoming waste collection times</p>
            </div>

            {nextSchedule ? (
              <>
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-br from-primary to-primary-container p-5 text-white">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-primary-container">Next Collection</p>
                    <h2 className="text-2xl font-extrabold mt-1">{nextSchedule.collection_date}</h2>
                    <p className="text-sm text-primary-container/80 mt-0.5">
                      Estimated arrival: {nextSchedule.estimated_arrival}
                    </p>
                  </div>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Truck className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">Vehicle</p>
                        <p className="text-[10px] text-text-secondary">{nextSchedule.vehicle_plate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <MapPin className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">Driver</p>
                        <p className="text-[10px] text-text-secondary">{nextSchedule.driver_name || 'Assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <CalendarClock className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">Route</p>
                        <p className="text-[10px] text-text-secondary">{nextSchedule.route_name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Preparation Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {[
                      'Place bins at designated collection point',
                      'Separate organic and inorganic waste',
                      'Ensure bins are accessible from the road',
                      'Mark your bin with your household ID',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-text-secondary">
                        <div className="h-4 w-4 rounded-full border-2 border-primary/30 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center p-6">
                <CalendarClock className="h-10 w-10 text-outline" />
                <p className="text-sm font-semibold text-text-primary">No upcoming collection scheduled</p>
                <p className="text-xs text-text-secondary max-w-xs">
                  Your next scheduled collection will appear here once assigned by the municipal authority.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <MobileBottomNav role="citizen" />
    </div>
  );
}
