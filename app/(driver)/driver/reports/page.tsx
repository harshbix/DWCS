'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/utils/toast';
import { AlertTriangle, Camera, Send, LogOut } from 'lucide-react';

export default function DriverReportsPage() {
  const { profile, logout } = useAuth();
  const [incidentType, setIncidentType] = useState('Breakdown');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Incident Logged', 'Report transmitted to municipal operations.');
    setIncidentDesc('');
    setPhotoAdded(false);
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-lg mx-auto">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Field Report</h1>
              <p className="text-xs text-text-secondary mt-0.5">Report incidents, delays, or breakdowns</p>
            </div>
            <div className="h-10 w-10 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/10 flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold block mb-2">Incident Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Breakdown', 'Blocked Road', 'Hazard', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIncidentType(type)}
                      className={`h-10 rounded-lg text-xs font-bold border transition-all ${
                        incidentType === type
                          ? 'bg-primary text-white border-primary'
                          : 'border-outline/20 text-text-secondary hover:bg-surface-container-low'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Incident Details</label>
                <textarea
                  rows={4}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Describe the delay, breakdown, or field hazard..."
                  className="w-full bg-surface-container-low border border-outline/10 p-3 rounded-lg text-sm resize-none"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => { setPhotoAdded(true); toast.success('Photo Added', 'Snapshot attached.'); }}
              >
                <Camera className="h-4 w-4 mr-2" />
                {photoAdded ? 'Snapshot Attached ✓' : 'Capture Incident Photo'}
              </Button>
            </div>

            <Button type="submit" isLoading={submitting} disabled={!incidentDesc.trim()}>
              <Send className="h-4 w-4 mr-2" /> Submit Field Report
            </Button>
          </form>

          <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-tertiary rounded-full flex items-center justify-center text-white font-bold uppercase shrink-0">
              {profile?.full_name?.substring(0, 2) || 'DR'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-text-secondary">{profile?.phone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="text-error border-error/20 hover:bg-error/5 shrink-0">
              <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </main>
      <MobileBottomNav role="driver" />
    </div>
  );
}
