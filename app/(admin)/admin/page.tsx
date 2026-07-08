'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonDashboard, SkeletonCard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { useSidebarStore } from '@/stores/sidebar.store';
import { formatTZS } from '@/utils/format';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Users, Truck, ShieldAlert, TrendingUp, BadgeDollarSign, AlertTriangle } from 'lucide-react';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { isOpen } = useSidebarStore();
  const queryClient = useQueryClient();
  const supabase = createBrowserSupabaseClient();

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

  // Add Citizen state
  const [isAddingCitizen, setIsAddingCitizen] = useState(false);
  const [addingState, setAddingState] = useState(false);
  const [newCitName, setNewCitName] = useState('');
  const [newCitEmail, setNewCitEmail] = useState('');
  const [newCitPhone, setNewCitPhone] = useState('');
  const [newCitAddress, setNewCitAddress] = useState('');

  const handleAddCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      toast.error('Error', 'Organization information unavailable. Cannot create citizen.');
      return;
    }
    setAddingState(true);
    try {
      const fakeAuthId = crypto.randomUUID();
      const { error: profileError } = await supabase.from('profiles').insert({
        id: fakeAuthId, auth_user_id: fakeAuthId, organization_id: orgId,
        full_name: newCitName, phone: newCitPhone, email: newCitEmail, status: 'active',
      });
      if (profileError) throw profileError;
      const { error: citizenError } = await supabase.from('citizens').insert({ id: fakeAuthId, organization_id: orgId, address: newCitAddress });
      if (citizenError) throw citizenError;
      const { data: roleData } = await supabase.from('roles').select('id').eq('name', 'citizen').single();
      if (roleData?.id) await supabase.from('user_roles').insert({ profile_id: fakeAuthId, role_id: roleData.id });
      toast.success('Citizen Created', `${newCitName} registered successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin-citizens'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setNewCitName(''); setNewCitEmail(''); setNewCitPhone(''); setNewCitAddress('');
      setIsAddingCitizen(false);
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to create citizen.');
    } finally { setAddingState(false); }
  };

  if (!orgId && !isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopNavigation />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-sm font-semibold text-text-primary">Organization information unavailable</p>
            <p className="text-xs text-text-secondary mt-1">Please refresh or contact your system administrator.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Refresh</Button>
          </div>
        </main>
        <MobileBottomNav role="admin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="dashboard" setActiveTab={(tab) => router.push(`/admin/${tab === 'dashboard' ? '' : tab}`)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {isLoading ? (
            <SkeletonDashboard />
          ) : error ? (
            <ErrorDisplay error={error as Error} onRetry={refetch} />
          ) : (
            <div className="flex flex-col gap-6 p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-text-primary">Operations Overview</h1>
                  <p className="text-xs text-text-secondary">Municipal analytics & payments ledger</p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isAddingCitizen} onOpenChange={setIsAddingCitizen}>
                    <DialogTrigger asChild><Button size="sm">Add Citizen</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Register New Citizen</DialogTitle></DialogHeader>
                      <form onSubmit={handleAddCitizen} className="flex flex-col gap-3 mt-2">
                        <Input placeholder="Full Name" value={newCitName} onChange={(e) => setNewCitName(e.target.value)} required />
                        <Input placeholder="Email Address" type="email" value={newCitEmail} onChange={(e) => setNewCitEmail(e.target.value)} required />
                        <Input placeholder="Phone Number" value={newCitPhone} onChange={(e) => setNewCitPhone(e.target.value)} required />
                        <Input placeholder="Physical Address" value={newCitAddress} onChange={(e) => setNewCitAddress(e.target.value)} />
                        <DialogFooter>
                          <DialogClose><Button type="button" variant="outline">Cancel</Button></DialogClose>
                          <Button type="submit" isLoading={addingState}>Register</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => { queryClient.invalidateQueries(); toast.info('Synced', 'Data refreshed.'); }}>
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Sync
                  </Button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Citizens', value: stats.total_citizens, sub: 'Active accounts', icon: <Users className="h-4 w-4 text-primary" /> },
                  { label: 'Active Drivers', value: stats.active_drivers, sub: 'On duty', icon: <Truck className="h-4 w-4 text-tertiary" /> },
                  { label: 'Fleet Vehicles', value: stats.active_vehicles, sub: 'Dispatched', icon: <Truck className="h-4 w-4 text-secondary" /> },
                  { label: 'Revenue Today', value: formatTZS(stats.revenue_today), sub: 'Collected', icon: <BadgeDollarSign className="h-4 w-4 text-primary" /> },
                  { label: 'Monthly Revenue', value: formatTZS(stats.revenue_this_month), sub: 'This period', icon: <TrendingUp className="h-4 w-4 text-primary" /> },
                  { label: 'Pending Complaints', value: stats.pending_complaints, sub: 'Requires action', icon: <ShieldAlert className="h-4 w-4 text-error" /> },
                ].map((item) => (
                  <Card key={item.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">{item.icon}<span /></div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{item.label}</p>
                      <h4 className="text-xl font-extrabold text-text-primary mt-1">{item.value}</h4>
                      <p className="text-[9px] text-primary font-semibold mt-0.5">{item.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider">Weekly Collection Efficiency</CardTitle>
                    <CardDescription className="text-xs">Bins collected vs. skipped</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-28 flex items-end justify-between px-2">
                      {[78, 88, 92, 85, 94, 72, 65].map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                          <div className="w-full max-w-[22px] bg-surface-container-high rounded-t-md h-24 flex items-end overflow-hidden">
                            <div className="w-full bg-primary transition-all" style={{ height: `${val}%` }} />
                          </div>
                          <span className="text-[8px] font-bold text-text-secondary">{['M','T','W','T','F','S','S'][idx]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider">Quick Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {[
                      { label: 'Citizen Accounts', href: '/admin/citizens', icon: <Users className="h-4 w-4 text-primary" /> },
                      { label: 'Complaints Center', href: '/admin/complaints', icon: <AlertTriangle className="h-4 w-4 text-error" /> },
                      { label: 'Reports & Analytics', href: '/admin/reports', icon: <TrendingUp className="h-4 w-4 text-primary" /> },
                    ].map((item) => (
                      <button key={item.href} onClick={() => router.push(item.href)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors text-left">
                        {item.icon}
                        <span className="text-sm font-semibold text-text-primary">{item.label}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
