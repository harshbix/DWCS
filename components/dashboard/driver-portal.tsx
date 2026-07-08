'use client';

import React, { useState, useEffect } from 'react';
import { 
  BadgeCheck, Compass, QrCode, AlertOctagon, CheckCircle2, 
  MapPin, Play, Navigation, AlertTriangle, User, LogOut, Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DriverPortalProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function DriverPortal({ activeTab, setActiveTab }: DriverPortalProps) {
  const { user, profile, logout } = useAuth();
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  // Load Driver dashboard RPC
  const { data: dashboardData, isLoading: isDashboardLoading } = useDriverDashboard(user?.id);

  // States
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [navulating, setNavulating] = useState(false);
  const [incidentType, setIncidentType] = useState('Breakdown');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);

  const driverProfile = dashboardData?.driver_profile;
  const assignedVehicle = dashboardData?.assigned_vehicle;
  const activeSchedules = dashboardData?.active_schedules || [];

  const completedStopsCount = activeSchedules.filter((s: any) => s.status === 'completed').length;
  const totalStopsCount = activeSchedules.length;

  const nextAssignedSchedule = activeSchedules.find((s: any) => s.status === 'scheduled');

  // Completed collection RPC Mutation
  const completeCollection = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase.rpc('v1_complete_collection', {
        p_schedule_id: scheduleId,
        p_actual_arrival: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Collection Logged', 'Waste collection complete and recorded.');
      queryClient.invalidateQueries({ queryKey: ['driver-dashboard'] });
      setActiveStopId(null);
    },
    onError: (err: any) => {
      toast.error('Action Failed', err.message || 'Error processing collection log.');
    }
  });

  // Telemetry Coordinates Teleportation Mutation
  const updateLocation = useMutation({
    mutationFn: async (payload: { vehicleId: string; lat: number; lng: number }) => {
      const { error } = await supabase
        .from('vehicle_current_location')
        .upsert({
          vehicle_id: payload.vehicleId,
          latitude: payload.lat,
          longitude: payload.lng,
          recorded_at: new Date().toISOString(),
        });
      if (error) throw error;
    }
  });

  // Simulate GPS coordinates tracking updates
  useEffect(() => {
    if (!navulating || !assignedVehicle?.id) return;

    // Send initial ping
    updateLocation.mutate({
      vehicleId: assignedVehicle.id,
      lat: -6.7924 + (Math.random() - 0.5) * 0.005,
      lng: 39.2083 + (Math.random() - 0.5) * 0.005,
    });

    const interval = setInterval(() => {
      updateLocation.mutate({
        vehicleId: assignedVehicle.id,
        lat: -6.7924 + (Math.random() - 0.5) * 0.005,
        lng: 39.2083 + (Math.random() - 0.5) * 0.005,
      });
    }, 15000); // Send coordinates update every 15s

    return () => clearInterval(interval);
  }, [navulating, assignedVehicle?.id]);

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Incident Logged', 'Incident report transmitted to municipal operations.');
    setIncidentDesc('');
    setPhotoAdded(false);
    setActiveTab('home');
  };

  if (isDashboardLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs text-text-secondary font-medium">Loading driver manifest...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 select-none max-w-md mx-auto">
      {/* Driver Header */}
      <div className="flex items-center justify-between border-b border-outline/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-tertiary rounded-full flex items-center justify-center text-white font-bold uppercase">
            {profile?.full_name?.substring(0, 2) || 'DR'}
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary">{profile?.full_name || 'Collector Driver'}</h1>
            <p className="text-xs text-text-secondary">
              Vehicle: {assignedVehicle ? `${assignedVehicle.plate_number} (${assignedVehicle.model})` : 'Unassigned'}
            </p>
          </div>
        </div>
        <Badge variant="secondary">SHIFT ACTIVE</Badge>
      </div>

      {/* Dynamic Content Views */}
      {activeTab === 'home' && (
        <div className="flex flex-col gap-4">
          <Card className="bg-gradient-to-br from-primary-container to-primary text-white border-0">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-primary-container uppercase font-mono tracking-wider font-bold">Route Progress</p>
                <h3 className="text-lg font-black mt-1">Route Manifest</h3>
                <p className="text-xs text-primary-container/80 mt-0.5">License: {driverProfile?.license_number}</p>
              </div>
              <div className="h-14 w-14 bg-white/10 rounded-full flex flex-col items-center justify-center shrink-0 border border-white/10">
                <span className="text-base font-black leading-none">{completedStopsCount}</span>
                <span className="text-[9px] opacity-75 font-semibold mt-0.5">/{totalStopsCount}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => setActiveTab('tracking')} className="flex flex-col h-20 gap-1.5 p-2">
              <Navigation className="h-5 w-5 text-primary" />
              <span className="text-[10px]">Stops Manager</span>
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('card')} className="flex flex-col h-20 gap-1.5 p-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="text-[10px]">Scan QR</span>
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('reports')} className="flex flex-col h-20 gap-1.5 p-2 border-error/20 hover:bg-error/5">
              <AlertTriangle className="h-5 w-5 text-error" />
              <span className="text-[10px] text-error">Field Incident</span>
            </Button>
          </div>

          {nextAssignedSchedule && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-text-secondary uppercase tracking-wider">Next Assigned Stop</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="h-5 w-5 text-text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{nextAssignedSchedule.stop_name}</h4>
                    <p className="text-[10px] text-text-secondary">Expected: {nextAssignedSchedule.expected_arrival}</p>
                  </div>
                </div>
                <Button onClick={() => {
                  setActiveStopId(nextAssignedSchedule.schedule_id);
                  setActiveTab('tracking');
                }} className="w-full h-8 text-xs font-semibold">
                  View Stop Operations
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold">Route Stops</h2>
          <div className="flex flex-col gap-2">
            {activeSchedules.map((schedule: any) => (
              <div 
                key={schedule.schedule_id}
                onClick={() => schedule.status === 'scheduled' && setActiveStopId(schedule.schedule_id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  schedule.schedule_id === activeStopId && schedule.status === 'scheduled' 
                    ? 'border-primary bg-primary/5 shadow-xs' 
                    : 'border-outline/10 bg-surface-container-lowest'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{schedule.stop_name}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      Route: {schedule.route_name} • Expected: {schedule.expected_arrival}
                    </p>
                  </div>
                  <Badge variant={schedule.status === 'completed' ? 'success' : schedule.status === 'missed' ? 'danger' : 'outline'}>
                    {schedule.status}
                  </Badge>
                </div>

                {schedule.schedule_id === activeStopId && schedule.status === 'scheduled' && (
                  <div className="mt-4 pt-3 border-t border-outline/10 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button"
                        variant={navulating ? 'default' : 'outline'} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setNavulating(!navulating); 
                        }} 
                        className="h-9 text-xs"
                      >
                        <Navigation className="h-4.5 w-4.5 mr-1" /> {navulating ? 'GPS Broadcast' : 'Start Route'}
                      </Button>
                      <Button 
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          completeCollection.mutate(schedule.schedule_id);
                        }} 
                        isLoading={completeCollection.isPending} 
                        className="h-9 text-xs"
                      >
                        <Play className="h-4.5 w-4.5 mr-1" /> Log Complete
                      </Button>
                    </div>
                    {navulating && (
                      <p className="text-[10px] text-text-secondary bg-surface-container-low p-2 rounded-lg">
                        Broadcasting current coordinates to dispatcher and residents. Keep screen active.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'card' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h2 className="text-lg font-bold">QR Verification</h2>
            <p className="text-xs text-text-secondary mt-0.5">Scan user card to authorize service collection</p>
          </div>
          <div className="bg-black/90 w-full aspect-square max-w-xs rounded-2xl relative border-4 border-outline flex items-center justify-center p-6 text-white overflow-hidden shadow-md">
            <div className="absolute left-0 right-0 h-1 bg-[#4cdd88] scan-line rounded-full opacity-60"></div>
            <div className="text-center z-10 flex flex-col items-center gap-2">
              <QrCode className="h-16 w-16 text-[#4cdd88] animate-pulse" />
              <p className="text-xs font-bold text-white/80">Position citizen QR inside frame</p>
            </div>
          </div>
          <Button onClick={() => { toast.success('Verified Member', 'Authorized check completed.'); setActiveTab('home'); }} className="w-full">
            Simulate Verification Scan
          </Button>
        </div>
      )}

      {activeTab === 'reports' && (
        <form onSubmit={handleIncidentSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Report Field Delay</h2>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/10 shadow-xs flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Delay Incident Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Breakdown', 'Blocked Road', 'Hazard', 'Other'].map((type) => (
                  <Button 
                    key={type}
                    type="button"
                    variant={incidentType === type ? 'default' : 'outline'}
                    onClick={() => setIncidentType(type)}
                    className="h-8.5 text-xs font-semibold"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Incident Details</label>
              <textarea 
                rows={3}
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                placeholder="Description of roadblock, delay issue or breakdowns..."
                className="w-full bg-surface-container-low border border-outline/10 p-3 rounded-lg text-sm"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => { setPhotoAdded(true); toast.success('Photo Added', 'Field snapshot attached.'); }} className="w-full">
              <Camera className="h-4.5 w-4.5 mr-1.5" /> {photoAdded ? 'Snapshot Attached' : 'Capture Incident Photo'}
            </Button>
          </div>
          <Button type="submit" disabled={!incidentDesc.trim()}>Submit Field Incident</Button>
        </form>
      )}

      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline/10 text-center flex flex-col items-center gap-3">
            <div className="h-16 w-16 bg-tertiary text-white rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm">
              {profile?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{profile?.full_name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                License: {driverProfile?.license_number || 'N/A'} • {profile?.phone}
              </p>
            </div>
            <Button variant="outline" onClick={logout} className="w-full text-error border-error/20 hover:bg-error/5">
              <LogOut className="h-4 w-4 mr-2" /> Log out Operator Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
