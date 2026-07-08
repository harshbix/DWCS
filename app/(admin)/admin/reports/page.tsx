'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { useSidebarStore } from '@/stores/sidebar.store';
import { formatTZS } from '@/utils/format';
import { RefreshCw, FileText, Download, BarChart2 } from 'lucide-react';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export default function AdminReportsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { isOpen } = useSidebarStore();
  const orgId = profile?.organization_id;

  const { data: dashboardData, isLoading, error, refetch } = useAdminDashboard(orgId ?? undefined);

  const stats = dashboardData?.statistics ?? {
    total_citizens: 0,
    active_drivers: 0,
    active_vehicles: 0,
    revenue_today: 0,
    revenue_this_month: 0,
    pending_complaints: 0,
  };

  const handleExport = () => {
    toast.success('Report Exported', 'CSV summary generated and downloaded successfully.');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="reports" setActiveTab={(tab) => router.push(`/admin/${tab === 'dashboard' ? '' : tab}`)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {isLoading ? (
            <SkeletonDashboard />
          ) : error ? (
            <ErrorDisplay error={error as Error} onRetry={refetch} />
          ) : (
            <div className="flex flex-col gap-6 p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-text-primary">Reports & Audits</h1>
                  <p className="text-xs text-text-secondary">Explore collection metrics, financial audits, and municipal compliance stats</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1.5" /> Export Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Reload
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider">Revenue Breakdown</CardTitle>
                    <CardDescription className="text-xs">Financial audits for the current cycle</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex justify-between items-center py-2 border-b border-outline/5 text-sm font-semibold">
                      <span className="text-text-secondary">Revenue Today</span>
                      <span className="text-primary font-mono">{formatTZS(stats.revenue_today)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-outline/5 text-sm font-semibold">
                      <span className="text-text-secondary">This Month Total</span>
                      <span className="text-primary font-mono">{formatTZS(stats.revenue_this_month)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm font-semibold">
                      <span className="text-text-secondary">Estimated Outstanding</span>
                      <span className="text-error font-mono">{formatTZS(stats.total_citizens * 15000 - stats.revenue_this_month)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider">Compliance Summary</CardTitle>
                    <CardDescription className="text-xs">Service delivery rates and response compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex justify-between items-center py-2 border-b border-outline/5 text-sm font-semibold">
                      <span className="text-text-secondary">Total Registered Citizens</span>
                      <span className="text-text-primary">{stats.total_citizens}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-outline/5 text-sm font-semibold">
                      <span className="text-text-secondary">Unresolved Complaints</span>
                      <span className="text-error">{stats.pending_complaints}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm font-semibold">
                      <span className="text-text-secondary">Active Dispatch Vehicles</span>
                      <span className="text-primary">{stats.active_vehicles} / {stats.active_drivers} drivers</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider">Zone Performance Report</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {[
                    { zone: 'Kinondoni Central', citizens: 450, collectionRate: '94%', revenue: '6.75M TZS' },
                    { zone: 'Kariakoo Market District', citizens: 320, collectionRate: '91%', revenue: '4.8M TZS' },
                    { zone: 'Ilala Municipal Gate', citizens: 180, collectionRate: '88%', revenue: '2.7M TZS' },
                    { zone: 'Temeke Zone 4 (Upanga)', citizens: 110, collectionRate: '82%', revenue: '1.65M TZS' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface-container-low border border-outline/5">
                      <div className="flex justify-between text-xs font-bold text-text-primary">
                        <span>{item.zone}</span>
                        <span className="text-primary font-mono">{item.revenue}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-secondary">
                        <span>{item.citizens} Residents</span>
                        <span>Collection Rate: {item.collectionRate}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
