'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useComplaints } from '@/hooks/useComplaints';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { formatDate } from '@/utils/format';
import { AlertTriangle, Camera, MapPin, Send } from 'lucide-react';
import { toast } from '@/utils/toast';
import type { ComplaintType } from '@/types/database';

export default function CitizenComplaintsPage() {
  const { user } = useAuth();
  const { complaints, isLoading, error, refetch, submitComplaint } = useComplaints(user?.id);

  const [complaintType, setComplaintType] = useState<ComplaintType>('illegal_dumping');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoc, setReportLoc] = useState('');
  const [locationAcquired, setLocationAcquired] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);

  const handleGPS = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setReportLoc(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setLocationAcquired(true);
      },
      () => {
        setReportLoc('-8.9000, 33.4500');
        setLocationAcquired(true);
        toast.info('Location Fallback', 'Using default Mbeya coordinates.');
      }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !reportDesc.trim()) return;

    const coords = reportLoc.split(',');
    const lat = coords[0] ? parseFloat(coords[0].trim()) : undefined;
    const lng = coords[1] ? parseFloat(coords[1].trim()) : undefined;

    try {
      await submitComplaint.mutateAsync({
        citizenId: user.id,
        complaintType,
        description: reportDesc,
        latitude: lat,
        longitude: lng,
        imageFile,
      });
      setReportDesc('');
      setImageFile(null);
      setLocationAcquired(false);
      setReportLoc('');
      setShowForm(false);
    } catch { /* handled in hook */ }
  };

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-text-primary">Complaints</h1>
                <p className="text-xs text-text-secondary mt-0.5">Report issues to municipal authority</p>
              </div>
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'View Reports' : 'File Report'}
              </Button>
            </div>

            {showForm ? (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline/10 flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Issue Category</label>
                    <select
                      value={complaintType}
                      onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
                      className="w-full bg-surface-container-low border border-outline/10 h-10 px-3 rounded-lg text-sm"
                    >
                      <option value="illegal_dumping">Illegal Dumping</option>
                      <option value="overflowing_bin">Overflowing Bin</option>
                      <option value="missed_collection">Missed Collection</option>
                      <option value="damaged_container">Damaged Container</option>
                      <option value="hazardous_waste">Hazardous Waste</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Details of complaint addressed to TMWA..."
                      className="w-full bg-surface-container-low border border-outline/10 p-3 rounded-lg text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleGPS} className="flex-1">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      {locationAcquired ? 'GPS Fixed' : 'Get Location'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                      <Camera className="h-4 w-4 mr-1.5" />
                      {imageFile ? 'Photo Ready' : 'Add Photo'}
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])} accept="image/*" className="hidden" />
                  </div>
                  {locationAcquired && (
                    <p className="text-[10px] text-text-secondary bg-surface-container-low p-2 rounded-lg font-mono">{reportLoc}</p>
                  )}
                </div>
                <Button type="submit" isLoading={submitComplaint.isPending} disabled={!reportDesc.trim()}>
                  <Send className="h-4 w-4 mr-2" /> Submit Report
                </Button>
              </form>
            ) : (
              <>
                {complaints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center p-6">
                    <AlertTriangle className="h-10 w-10 text-outline" />
                    <p className="text-sm font-semibold text-text-primary">No complaints filed</p>
                    <p className="text-xs text-text-secondary">Use the button above to file a new report.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {complaints.map((comp) => (
                      <Card key={comp.id}>
                        <CardContent className="p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-primary capitalize">
                              {comp.complaint_type.replace(/_/g, ' ')}
                            </span>
                            <div className="flex gap-2">
                              <Badge variant={comp.priority === 'high' || comp.priority === 'critical' ? 'danger' : 'outline'}>
                                {comp.priority}
                              </Badge>
                              <Badge variant={comp.status === 'resolved' ? 'success' : comp.status === 'pending' ? 'warning' : 'default'}>
                                {comp.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary line-clamp-2">{comp.description}</p>
                          <p className="text-[10px] text-text-secondary">{formatDate(comp.created_at)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <MobileBottomNav role="citizen" />
    </div>
  );
}
