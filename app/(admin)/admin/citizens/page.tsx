'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { Search, RefreshCw, Users } from 'lucide-react';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export default function AdminCitizensPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createBrowserSupabaseClient();

  const orgId = profile?.organization_id;
  const [searchCitizen, setSearchCitizen] = useState('');
  const [isAddingCitizen, setIsAddingCitizen] = useState(false);
  const [addingState, setAddingState] = useState(false);
  const [newCitName, setNewCitName] = useState('');
  const [newCitEmail, setNewCitEmail] = useState('');
  const [newCitPhone, setNewCitPhone] = useState('');
  const [newCitAddress, setNewCitAddress] = useState('');

  // Query Citizen list from database
  const { data: citizensList = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-citizens', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('citizens')
        .select('id, address, profiles(full_name, phone, email, status)')
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const handleAddCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      toast.error('Error', 'Organization information unavailable.');
      return;
    }
    setAddingState(true);
    try {
      const fakeAuthId = crypto.randomUUID();
      const { error: profileError } = await supabase.from('profiles').insert({
        id: fakeAuthId,
        auth_user_id: fakeAuthId,
        organization_id: orgId,
        full_name: newCitName,
        phone: newCitPhone,
        email: newCitEmail,
        status: 'active',
      });
      if (profileError) throw profileError;
      const { error: citizenError } = await supabase.from('citizens').insert({
        id: fakeAuthId,
        organization_id: orgId,
        address: newCitAddress,
      });
      if (citizenError) throw citizenError;
      const { data: roleData } = await supabase.from('roles').select('id').eq('name', 'citizen').single();
      if (roleData?.id) {
        await supabase.from('user_roles').insert({
          profile_id: fakeAuthId,
          role_id: roleData.id,
        });
      }
      toast.success('Citizen Created', `${newCitName} registered successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin-citizens'] });
      setNewCitName(''); setNewCitEmail(''); setNewCitPhone(''); setNewCitAddress('');
      setIsAddingCitizen(false);
    } catch (err: unknown) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to create citizen.');
    } finally {
      setAddingState(false);
    }
  };

  const filteredCitizens = citizensList.filter((c: any) =>
    c.profiles?.full_name?.toLowerCase().includes(searchCitizen.toLowerCase()) ||
    c.profiles?.phone?.includes(searchCitizen) ||
    c.id?.toLowerCase().includes(searchCitizen.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="citizens" setActiveTab={(tab) => router.push(`/admin/${tab === 'dashboard' ? '' : tab}`)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {isLoading ? (
            <SkeletonDashboard />
          ) : error ? (
            <ErrorDisplay error={error as Error} onRetry={refetch} />
          ) : (
            <div className="flex flex-col gap-6 p-4 sm:p-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-text-primary">Citizen Accounts Directory</h1>
                  <p className="text-xs text-text-secondary">Manage and register waste collection service members</p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isAddingCitizen} onOpenChange={setIsAddingCitizen}>
                    <DialogTrigger asChild>
                      <Button size="sm">Add Citizen</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register New Citizen</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddCitizen} className="flex flex-col gap-3 mt-2">
                        <Input placeholder="Full Name" value={newCitName} onChange={(e) => setNewCitName(e.target.value)} required />
                        <Input placeholder="Email Address" type="email" value={newCitEmail} onChange={(e) => setNewCitEmail(e.target.value)} required />
                        <Input placeholder="Phone Number" value={newCitPhone} onChange={(e) => setNewCitPhone(e.target.value)} required />
                        <Input placeholder="Physical Address" value={newCitAddress} onChange={(e) => setNewCitAddress(e.target.value)} />
                        <DialogFooter>
                          <DialogClose>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit" isLoading={addingState}>Register</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-citizens'] }); toast.info('Refreshed', 'Database cache reloaded.'); }}>
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Sync
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary/50" />
                <Input
                  placeholder="Search citizens by name, member ID, or phone..."
                  className="pl-9 h-10 text-sm"
                  value={searchCitizen}
                  onChange={(e) => setSearchCitizen(e.target.value)}
                />
              </div>

              <Card className="overflow-hidden">
                {filteredCitizens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <Users className="h-8 w-8 text-outline" />
                    <p className="text-sm font-semibold text-text-primary">No citizens found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Citizen ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Physical Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCitizens.map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono text-xs">{c.id?.substring(0, 8).toUpperCase()}</TableCell>
                            <TableCell className="font-bold">{c.profiles?.full_name}</TableCell>
                            <TableCell>{c.profiles?.phone || 'N/A'}</TableCell>
                            <TableCell>{c.profiles?.email}</TableCell>
                            <TableCell className="text-text-secondary text-xs">{c.address}</TableCell>
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
