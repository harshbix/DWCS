'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createBrowserSupabaseClient();

  const orgId = profile?.organization_id;

  // Query Complaint manifest from database
  const { data: complaintsList = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-complaints', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('complaints')
        .select('id, complaint_type, priority, status, description, created_at, latitude, longitude, citizens(profiles(full_name, phone))')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status Updated', 'Complaint status has been updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
    },
    onError: (err: Error) => {
      toast.error('Action Failed', err.message);
    },
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="complaints" setActiveTab={(tab) => router.push(`/admin/${tab === 'dashboard' ? '' : tab}`)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {isLoading ? (
            <SkeletonDashboard />
          ) : error ? (
            <ErrorDisplay error={error as Error} onRetry={refetch} />
          ) : (
            <div className="flex flex-col gap-6 p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-text-primary">Complaints Dispatch Center</h1>
                  <p className="text-xs text-text-secondary">Track, dispatch, and resolve citizen grievances and collection anomalies</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-complaints'] }); toast.info('Refreshed', 'Database cache reloaded.'); }}>
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Sync
                </Button>
              </div>

              <Card className="overflow-hidden">
                {complaintsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <ShieldAlert className="h-8 w-8 text-outline" />
                    <p className="text-sm font-semibold text-text-primary">No complaints filed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Complaint ID</TableHead>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Urgency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complaintsList.map((comp: any) => (
                          <TableRow key={comp.id}>
                            <TableCell className="font-mono text-xs">{comp.id?.substring(0, 8).toUpperCase()}</TableCell>
                            <TableCell>
                              <p className="font-bold">{comp.citizens?.profiles?.full_name || 'Anonymous'}</p>
                              <p className="text-[10px] text-text-secondary">{comp.citizens?.profiles?.phone}</p>
                            </TableCell>
                            <TableCell className="font-semibold capitalize">
                              {comp.complaint_type?.replace(/_/g, ' ')}
                            </TableCell>
                            <TableCell className="text-text-secondary text-xs">
                              {comp.latitude ? `${comp.latitude.toFixed(4)}, ${comp.longitude.toFixed(4)}` : 'No GPS coords'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={comp.priority === 'critical' || comp.priority === 'high' ? 'danger' : comp.priority === 'medium' ? 'warning' : 'default'}>
                                {comp.priority || 'medium'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={comp.status === 'resolved' ? 'success' : comp.status === 'pending' ? 'danger' : 'default'}>
                                {comp.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-1.5">
                              {comp.status === 'pending' && (
                                <Button size="icon" variant="outline" className="h-7 px-2 text-xs" onClick={() => updateStatus.mutate({ id: comp.id, status: 'investigating' })}>
                                  Investigate
                                </Button>
                              )}
                              {comp.status !== 'resolved' && (
                                <Button size="icon" variant="outline" className="h-7 px-2 text-xs text-primary border-primary/20 hover:bg-primary/5" onClick={() => updateStatus.mutate({ id: comp.id, status: 'resolved' })}>
                                  Resolve
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
