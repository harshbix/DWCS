'use client';

import React, { useState } from 'react';
import { 
  BadgeCheck, Compass, QrCode, AlertOctagon, CheckCircle2, 
  MapPin, Play, Navigation, AlertTriangle, User, LogOut, Camera
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stop } from '@/types';

interface DriverPortalProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * Driver Portal UI Sub-shell.
 */
export function DriverPortal({ activeTab, setActiveTab }: DriverPortalProps) {
  const { setRole, logout } = useAuthStore();
  
  // Driver Local States
  const [completedStops, setCompletedStops] = useState(12);
  const [activeStopId, setActiveStopId] = useState<number>(4);
  const [navulating, setNavulating] = useState(false);
  const [collectingState, setCollectingState] = useState(false);
  
  const [incidentType, setIncidentType] = useState('Breakdown');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);

  const [stops, setStops] = useState<Stop[]>([
    { id: 1, address: 'Plot 42, Upanga South', area: 'Upanga', bins: 2, type: 'Household', estTime: '08:15 AM', status: 'Completed' },
    { id: 2, address: 'Muhimbili Hospital Gate C', area: 'Upanga', bins: 8, type: 'Medical Waste', estTime: '09:00 AM', status: 'Completed' },
    { id: 3, address: 'Coco Beach Public Restrooms', area: 'Oysterbay', bins: 4, type: 'Recycling', estTime: '09:45 AM', status: 'Completed' },
    { id: 4, address: 'Kariakoo Market, Block B', area: 'Kariakoo', bins: 15, type: 'Commercial Waste', estTime: '10:15 AM', status: 'Pending' },
    { id: 5, address: 'Kinondoni Block 12 Main St', area: 'Kinondoni', bins: 14, type: 'Household', estTime: '11:00 AM', status: 'Pending' },
    { id: 6, address: 'Ali Hassan Mwinyi Rd, Plot 9', area: 'Kinondoni', bins: 6, type: 'Commercial Waste', estTime: '11:30 AM', status: 'Failed' }
  ]);

  const handleCompleteCollection = () => {
    setCollectingState(true);
    setTimeout(() => {
      setCollectingState(false);
      setCompletedStops((prev) => prev + 1);
      setStops((prev) =>
        prev.map((s) => (s.id === activeStopId ? { ...s, status: 'Completed' as const } : s))
      );
      toast.success('Collection Complete', 'Bins collected and cataloged.');
      setActiveStopId(5); // Shift to next stop
    }, 1200);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Incident Reported', 'Municipal dispatch alert generated.');
    setIncidentDesc('');
    setPhotoAdded(false);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 select-none max-w-md mx-auto">
      {/* Driver Header */}
      <div className="flex items-center justify-between border-b border-outline/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-tertiary rounded-full flex items-center justify-center text-white font-bold">
            MT
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary">Marcus Thorne</h1>
            <p className="text-xs text-text-secondary">Vehicle: V-WM402 (TZ-402)</p>
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
                <h3 className="text-lg font-black mt-1">Route 04 - Upanga</h3>
                <p className="text-xs text-primary-container/80 mt-0.5">Est. completion: 14:30 PM</p>
              </div>
              <div className="h-14 w-14 bg-white/10 rounded-full flex flex-col items-center justify-center shrink-0 border border-white/10">
                <span className="text-base font-black leading-none">{completedStops}</span>
                <span className="text-[9px] opacity-75 font-semibold mt-0.5">/48</span>
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-text-secondary uppercase tracking-wider">Next Assigned Stop</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-5 w-5 text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Kariakoo Market, Block B</h4>
                  <p className="text-[10px] text-text-secondary">Commercial Waste • 15 Bins</p>
                </div>
              </div>
              <Button onClick={() => setActiveTab('tracking')} className="w-full h-8 text-xs font-semibold">
                View Stop Operations
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold">Route Stops</h2>
          <div className="flex flex-col gap-2">
            {stops.map((stop) => (
              <div 
                key={stop.id}
                onClick={() => stop.status === 'Pending' && setActiveStopId(stop.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${stop.id === activeStopId && stop.status === 'Pending' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline/10 bg-surface-container-lowest'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{stop.address}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">{stop.type} • {stop.bins} Bins • {stop.estTime}</p>
                  </div>
                  <Badge variant={stop.status === 'Completed' ? 'success' : stop.status === 'Failed' ? 'danger' : 'outline'}>
                    {stop.status}
                  </Badge>
                </div>

                {stop.id === activeStopId && stop.status === 'Pending' && (
                  <div className="mt-4 pt-3 border-t border-outline/10 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={navulating ? 'default' : 'outline'} onClick={(e) => { e.stopPropagation(); setNavulating(!navulating); }} className="h-9 text-xs">
                        <Navigation className="h-4.5 w-4.5 mr-1" /> {navulating ? 'Route Active' : 'Navigate'}
                      </Button>
                      <Button onClick={(e) => { e.stopPropagation(); handleCompleteCollection(); }} isLoading={collectingState} className="h-9 text-xs">
                        <Play className="h-4.5 w-4.5 mr-1" /> Log Collection
                      </Button>
                    </div>
                    {navulating && (
                      <p className="text-[10px] text-text-secondary bg-surface-container-low p-2 rounded-lg">
                        Turn left onto Kariakoo St. Collector station is on the right.
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
            {/* Scan overlay line */}
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
              MT
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Marcus Thorne</h3>
              <p className="text-xs text-text-secondary mt-0.5">Driver Rank 1 • +255 754 888 777</p>
            </div>
            <Button variant="outline" onClick={() => { setRole('citizen'); logout(); }} className="w-full text-error border-error/20 hover:bg-error/5">
              <LogOut className="h-4 w-4 mr-2" /> Log out Operator Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
