'use client';

import React, { useState } from 'react';
import { 
  Users, Truck, ShieldAlert, BadgePlus, Search, 
  MapPin, CheckCircle2, User, RefreshCw, Clipboard, Play
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notification.store';
import { toast } from '@/utils/toast';
import { formatTZS } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Citizen, Complaint, FleetVehicle } from '@/types';

interface AdminPortalProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * Admin Portal UI Sub-shell.
 */
export function AdminPortal({ activeTab, setActiveTab }: AdminPortalProps) {
  // Mock Administration Datasets
  const [citizens, setCitizens] = useState<Citizen[]>([
    { id: 'TZ-KND-00124', name: 'Juma Hamisi', phone: '+255 712 345 678', zone: 'Kinondoni, District A', paymentStatus: 'Paid', qrActive: true },
    { id: 'TZ-KND-00156', name: 'Asha Mwinyi', phone: '+255 654 987 123', zone: 'Kinondoni, District B', paymentStatus: 'Overdue', qrActive: true },
    { id: 'TZ-TEM-00892', name: 'Elias Mwakalebela', phone: '+255 783 222 111', zone: 'Temeke, Zone 4', paymentStatus: 'Overdue', qrActive: true },
    { id: 'TZ-ILK-00455', name: 'Emmanuel Masawe', phone: '+255 621 555 444', zone: 'Ilala, City Center', paymentStatus: 'Paid', qrActive: true },
    { id: 'TZ-KND-00212', name: 'Lulu Makoye', phone: '+255 744 333 999', zone: 'Kinondoni, Kawe', paymentStatus: 'Overdue', qrActive: true }
  ]);

  const [complaints, setComplaints] = useState<Complaint[]>([
    { id: '#TMWA-9821', reporter: 'Abeid Mwakalebela', phone: '+255 712 345 678', type: 'Illegal Dumping', urgency: 'CRITICAL', status: 'Pending', assignedOfficer: 'Insp. Hassan K.', location: 'Mlimani City West Entrance', description: 'Massive pile of commercial waste and plastics dumped overnight.', timestamp: '10 mins ago' },
    { id: '#TMWA-9755', reporter: 'Sarah Lyimo', phone: '+255 654 987 123', type: 'Noise Pollution', urgency: 'LOW', status: 'Resolved', assignedOfficer: 'Officer Mariam', location: 'Oysterbay, Toure Dr.', description: 'Loud collection trucks operating at 3 AM.', timestamp: '2 hours ago' },
    { id: '#TMWA-9810', reporter: 'Bakari Juma', phone: '+255 783 222 111', type: 'Overflowing Bin', urgency: 'MEDIUM', status: 'Processing', assignedOfficer: 'Unit 4 (Mbezi)', location: 'Kariakoo Market, Block B', description: 'Bin has not been collected in 5 days, odor is unbearable.', timestamp: '5 hours ago' }
  ]);

  const [fleet] = useState<FleetVehicle[]>([
    { plate: 'T 123 ABC', status: 'En Route', speed: '42 km/h', fuel: '68%', route: 'Route 14 - Kinondoni', progress: 75, driverName: 'Alex', x: 42, y: 35 },
    { plate: 'T 456 DEF', status: 'At Stop', speed: '0 km/h', fuel: '45%', route: 'Route 04 - Kariakoo', progress: 50, driverName: 'Marcus Thorne', x: 68, y: 22 },
    { plate: 'T 889 GHI', status: 'Breakdown', speed: '0 km/h', fuel: '12%', route: 'Route 09 - Ilala', progress: 10, driverName: 'Juma S.', x: 55, y: 62 }
  ]);

  // Form Modals States
  const [searchCitizen, setSearchCitizen] = useState('');
  const [newCitName, setNewCitName] = useState('');
  const [newCitPhone, setNewCitPhone] = useState('');
  const [newCitZone, setNewCitZone] = useState('Kinondoni, District A');
  const [isAddingCitizen, setIsAddingCitizen] = useState(false);

  const handleAddCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitName.trim() || !newCitPhone.trim()) return;

    const newCitizen: Citizen = {
      id: `TZ-KND-00${Math.floor(100 + Math.random() * 899)}`,
      name: newCitName,
      phone: newCitPhone,
      zone: newCitZone,
      paymentStatus: 'Overdue',
      qrActive: true,
    };

    setCitizens((prev) => [newCitizen, ...prev]);
    toast.success('Citizen Created', `${newCitName} added successfully.`);
    setNewCitName('');
    setNewCitPhone('');
    setIsAddingCitizen(false);
  };

  const filteredCitizens = citizens.filter((c) =>
    c.name.toLowerCase().includes(searchCitizen.toLowerCase()) ||
    c.phone.includes(searchCitizen) ||
    c.id.toLowerCase().includes(searchCitizen.toLowerCase())
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
                    <Input placeholder="Phone Number" value={newCitPhone} onChange={(e) => setNewCitPhone(e.target.value)} required />
                    <select
                      value={newCitZone}
                      onChange={(e) => setNewCitZone(e.target.value)}
                      className="w-full bg-surface-container border border-outline/10 h-10 px-3 rounded-lg text-sm"
                    >
                      <option value="Kinondoni, District A">Kinondoni District A</option>
                      <option value="Kinondoni, District B">Kinondoni District B</option>
                      <option value="Temeke, Zone 4">Temeke Zone 4</option>
                      <option value="Ilala, City Center">Ilala City Center</option>
                    </select>
                    <DialogFooter>
                      <DialogClose>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Register Citizen</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={() => toast.info('Data Synced', 'Refreshed direct database cache.')}>
                <RefreshCw className="h-4 w-4 mr-1.5" /> Sync Logs
              </Button>
            </div>
          </div>

          {/* Metrics grids */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Registered Citizens</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">12,482</h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">+4.2% MoM growth</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Active Drivers</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">450</h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">82% on active duty</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Fleet Vehicles</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">380</h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">GPS streams active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Revenues Today</p>
                <h4 className="text-xl font-extrabold mt-1 text-text-primary">{formatTZS(12500000)}</h4>
                <p className="text-[9px] text-primary font-semibold mt-0.5">Direct GePG receipts</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Zone District</TableHead>
                  <TableHead>Invoice Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCitizens.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell className="font-bold">{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell className="text-text-secondary">{c.zone}</TableCell>
                    <TableCell>
                      <Badge variant={c.paymentStatus === 'Paid' ? 'success' : 'danger'}>
                        {c.paymentStatus === 'Paid' ? 'Settled' : 'Overdue'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              <p className="text-[10px] text-text-secondary">Tracking 3 en-route garbage vehicles</p>
            </div>
            
            {/* Visual Markers Simulation overlay */}
            <div className="absolute top-[20%] left-[30%] bg-white px-2 py-1 rounded shadow-md text-[9px] font-bold">
              Alex (T 123 ABC) - En Route
            </div>
            <div className="absolute top-[50%] left-[65%] bg-white px-2 py-1 rounded shadow-md text-[9px] font-bold text-error border border-error/20">
              Juma S. (T 889 GHI) - Breakdown
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fleet.map((vehicle) => (
              <Card key={vehicle.plate}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm font-mono">{vehicle.plate}</span>
                    <Badge variant={vehicle.status === 'En Route' ? 'success' : vehicle.status === 'Breakdown' ? 'danger' : 'outline'}>
                      {vehicle.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">Driver: {vehicle.driverName} • Route: {vehicle.route}</p>
                  <p className="text-[10px] text-text-secondary mt-1">Fuel Level: {vehicle.fuel} | Speed: {vehicle.speed}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary">Complaints Dispatch Center</h2>

          <Card className="overflow-hidden">
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
                {complaints.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-mono text-xs">{comp.id}</TableCell>
                    <TableCell>
                      <p className="font-bold">{comp.reporter}</p>
                      <p className="text-[10px] text-text-secondary">{comp.phone}</p>
                    </TableCell>
                    <TableCell className="font-semibold">{comp.type}</TableCell>
                    <TableCell className="text-text-secondary text-xs">{comp.location}</TableCell>
                    <TableCell>
                      <Badge variant={comp.urgency === 'CRITICAL' ? 'danger' : comp.urgency === 'MEDIUM' ? 'warning' : 'default'}>
                        {comp.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={comp.status === 'Resolved' ? 'success' : comp.status === 'Processing' ? 'default' : 'outline'}>
                        {comp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
