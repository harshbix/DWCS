'use client';

import React, { useState } from 'react';
import { 
  Users, Truck, ShieldAlert, BadgePlus, Search, 
  MapPin, CheckCircle2, User, RefreshCw, Clipboard, Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { useNotificationStore } from '@/stores/notification.store';
import { toast } from '@/utils/toast';
import { formatTZS, formatDate } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface AdminPortalProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function AdminPortal({ activeTab, setActiveTab }: AdminPortalProps) {
  const { profile } = useAuth();
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  const orgId = profile?.organization_id || 'de1f4b88-1234-5678-abcd-ef0123456789';

  // Load Admin aggregate dashboard RPC
  const { data: dashboardData, isLoading: isDashboardLoading } = useAdminDashboard(orgId);

  // Zonal KPI aggregates
  const stats = dashboardData?.statistics || {
    total_citizens: 0,
    active_drivers: 0,
    active_vehicles: 0,
    revenue_today: 0,
    revenue_this_month: 0,
    pending_complaints: 0,
  };

  // State
  const [searchCitizen, setSearchCitizen] = useState('');
  const [newCitName, setNewCitName] = useState('');
  const [newCitEmail, setNewCitEmail] = useState('');
  const [newCitPhone, setNewCitPhone] = useState('');
  const [newCitAddress, setNewCitAddress] = useState('');
  const [isAddingCitizen, setIsAddingCitizen] = useState(false);
  const [addingState, setAddingState] = useState(false);

  // Query Citizen list from database
  const { data: citizensList = [], isLoading: isCitizensLoading } = useQuery({
    queryKey: ['admin-citizens', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizens')
        .select('id, address, profiles(full_name, phone, email, status)')
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  // Query Complaint manifest from database
  const { data: complaintsList = [], isLoading: isComplaintsLoading } = useQuery({
    queryKey: ['admin-complaints', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('id, complaint_type, priority, status, description, created_at, latitude, longitude, citizens(profiles(full_name, phone))')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  // Query Fleet vehicles list from database
  const { data: fleetList = [], isLoading: isFleetLoading } = useQuery({
    queryKey: ['admin-fleet', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, plate_number, model, status, assigned_driver_id, vehicle_current_location(*), drivers(profiles(full_name))')
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  // Citizen registration database operation (creates auth.users sync indirectly or database profile mapping)
  const handleAddCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitName.trim() || !newCitEmail.trim() || !newCitPhone.trim()) return;

    setAddingState(true);
    try {
      // 1. Create a dummy UUID to sync auth profile fields (representing pre-registered citizen)
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

      // Assign role ID
      const { data: roleData } = await supabase.from('roles').select('id').eq('name', 'citizen').single();
      if (roleData?.id) {
        await supabase.from('user_roles').insert({
          profile_id: fakeAuthId,
          role_id: roleData.id,
        });
      }

      toast.success('Citizen Created', `${newCitName} added successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin-citizens'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
      setNewCitName('');
      setNewCitEmail('');
      setNewCitPhone('');
      setNewCitAddress('');
      setIsAddingCitizen(false);
    } catch (err: any) {
      toast.error('Registration Error', err.message || 'Error occurred while creating account.');
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
    <div className="flex flex-col gap-6 p-4 sm:p-6 select-none w-full">
      {/* Dynamic Tab Rendering */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Operations Overview</h2>
              <p className="text-xs text-text-secondary">System telemetry analytics & municipal payments ledger</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Dialog open={isAddingCitizen} onOpenChange={setIsAddingCitizen}>
                <DialogTrigger asChild>
                  <Button size="sm">Add Citizen</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Citizen Account</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCitizenSubmit} className="flex flex-col gap-4 mt-2">
                    <Input placeholder="Full Name" value={newCitName} onChange={(e) => setNewCitName(e.target.value)} required />
                    <Input placeholder="Email Address" type="email" value={newCitEmail} onChange={(e) => setNewCitEmail(e.target.value)} required />
                    <Input placeholder="Phone Number" value={newCitPhone} onChange={(e) => setNewCitPhone(e.target.value)} required />
                    <Input placeholder="Physical Address" value={newCitAddress} onChange={(e) => setNewCitAddress(e.target.value)} required />
                    <DialogFooter>
                      <DialogClose>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" isLoading={addingState}>Register Citizen</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={() => {
                queryClient.invalidateQueries();
                toast.info('Data Synced', 'Refreshed direct database cache.');
              }}>
                <RefreshCw className="h-4 w-4 mr-1.5" /> Sync Logs
              </Button>
            </div>
          </div>

          {/* Metrics grids */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Registered Citizens</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">
                  {stats.total_citizens}
                </h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">Active accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Active Drivers</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">
                  {stats.active_drivers}
                </h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">On active duty</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Fleet Vehicles</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">
                  {stats.active_vehicles}
                </h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">Dispatched trucks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Pending Grievances</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">
                  {stats.pending_complaints}
                </h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">Critical response required</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Efficiency Custom Bar Chart representation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                  Weekly Collection Efficiency
                </CardTitle>
                <CardDescription className="text-xs">Targeted bins collected vs. skipped</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between px-2 pt-2">
                  {[78, 88, 92, 85, 94, 72, 65].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                      <div className="w-full max-w-[20px] bg-surface-container-high rounded-t-md h-24 flex items-end overflow-hidden">
                        <div className="w-full bg-primary" style={{ height: `${val}%` }} />
                      </div>
                      <span className="text-[8px] font-bold text-text-secondary">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Invoicing progress by Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                  Revenues by Municipal Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { zone: 'Kariakoo Market District', val: '4.2M TZS', width: '90%' },
                  { zone: 'Kinondoni Central Block A', val: '3.8M TZS', width: '78%' },
                  { zone: 'Ilala Municipal Gate', val: '2.1M TZS', width: '55%' },
                  { zone: 'Temeke Zone 4 (Upanga)', val: '1.5M TZS', width: '38%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-text-primary">
                      <span>{item.zone}</span>
                      <span className="text-primary font-mono">{item.val}</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'citizens' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary">Citizen Accounts Directory</h2>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary/50" />
              <Input 
                placeholder="Search citizens by name, member ID, or phone..." 
                className="pl-9 h-10 text-sm"
                value={searchCitizen}
                onChange={(e) => setSearchCitizen(e.target.value)}
              />
            </div>
          </div>

          <Card className="overflow-hidden">
            {isCitizensLoading ? (
              <div className="p-8 text-center text-xs text-text-secondary">Loading accounts manifest...</div>
            ) : (
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
            )}
          </Card>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary">Live GPS Fleet Tracking</h2>
          
          <div className="w-full h-80 bg-[#eef4fd] rounded-xl flex items-center justify-center border border-outline/10 shadow-inner relative">
            <div className="text-center z-10">
              <Truck className="h-12 w-12 mx-auto text-primary animate-bounce" />
              <p className="text-xs font-bold text-text-primary mt-2">Active Municipal Dispatch Telemetry</p>
              <p className="text-[10px] text-text-secondary">Tracking {fleetList.length} registered vehicles</p>
            </div>
            
            {fleetList.map((vehicle: any, idx: number) => {
              const loc = vehicle.vehicle_current_location?.[0];
              if (!loc) return null;
              
              const topPos = 20 + (idx * 20) % 60;
              const leftPos = 20 + (idx * 25) % 60;
              
              return (
                <div 
                  key={vehicle.id} 
                  style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                  className="absolute bg-white px-2 py-1 rounded shadow-md text-[9px] font-bold z-20 border border-outline/10"
                >
                  {vehicle.drivers?.profiles?.full_name || 'Driver'} ({vehicle.plate_number})
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isFleetLoading ? (
              <div className="col-span-3 p-8 text-center text-xs text-text-secondary">Fetching fleet status...</div>
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
                        Driver: {vehicle.drivers?.profiles?.full_name || 'Unassigned'} • Model: {vehicle.model}
                      </p>
                      {loc && (
                        <p className="text-[10px] text-primary mt-1 font-mono">
                          GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary">Complaints Dispatch Center</h2>

          <Card className="overflow-hidden">
            {isComplaintsLoading ? (
              <div className="p-8 text-center text-xs text-text-secondary">Loading grievances registry...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint ID</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
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
                        {comp.complaint_type?.replace('_', ' ')}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
