'use client';

import React, { useState, useRef } from 'react';
import { 
  CreditCard, History, MapPin, AlertTriangle, CheckCircle2, 
  X, Truck, Copy, Check, ExternalLink, Camera, Compass, 
  Send, Phone, Bell, User, QrCode 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { useComplaints } from '@/hooks/useComplaints';
import { usePayments } from '@/hooks/usePayments';
import { toast } from '@/utils/toast';
import { formatTZS, formatDate } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CitizenPortalProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function CitizenPortal({ activeTab, setActiveTab }: CitizenPortalProps) {
  const { user } = useAuth();
  
  // React Query hooks layer
  const { data: dashboardData, isLoading: isDashboardLoading } = useCitizenDashboard(user?.id);
  const { submitComplaint } = useComplaints(user?.id);
  const { makePayment } = usePayments(user?.id);

  // States
  const [copySuccess, setCopySuccess] = useState(false);
  const [payingState, setPayingState] = useState(false);
  const [alertNotify, setAlertNotify] = useState(false);

  // Grievance Form States
  const [complaintType, setComplaintType] = useState('illegal_dumping');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoc, setReportLoc] = useState('-6.7924, 39.2083');
  const [locationAcquired, setLocationAcquired] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const citizenProfile = dashboardData?.profile;
  const recentBill = dashboardData?.recent_bills?.[0];
  const nextSchedule = dashboardData?.next_schedule;

  const handlePayment = async () => {
    if (!recentBill) return;
    setPayingState(true);
    try {
      await makePayment.mutateAsync({
        billingId: recentBill.id,
        amount: recentBill.amount,
        provider: 'gepg',
        paymentMethod: 'mpesa',
        transactionReference: 'TX-' + upperCaseUUID(8),
      });
      toast.success('Payment Received', 'Invoice paid successfully.');
      setActiveTab('home');
    } catch {
      // toast.error handled in mutation hook
    } finally {
      setPayingState(false);
    }
  };

  const copyPayNumber = () => {
    if (recentBill?.control_number) {
      navigator.clipboard?.writeText(recentBill.control_number);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      toast.info('Image Attached', `${e.target.files[0].name} ready for upload.`);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !reportDesc.trim()) return;

    try {
      const coords = reportLoc.split(',');
      const lat = coords[0] ? parseFloat(coords[0].trim()) : undefined;
      const lng = coords[1] ? parseFloat(coords[1].trim()) : undefined;

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
      setActiveTab('home');
    } catch {
      // error handled in hooks
    }
  };

  const upperCaseUUID = (len: number) => {
    return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
  };

  if (isDashboardLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs text-text-secondary font-medium">Fetching dashboard stats...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 select-none max-w-md mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-outline/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Citizen Hub</h1>
          <p className="text-xs text-text-secondary">Address: {citizenProfile?.address || 'Unspecified'}</p>
        </div>
        <Badge variant={recentBill?.status === 'paid' ? 'success' : 'danger'}>
          {recentBill?.status === 'paid' ? 'Paid' : 'Overdue'}
        </Badge>
      </div>

      {/* Tab Selector */}
      {activeTab === 'home' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Monthly Utility Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {recentBill ? (
                <div>
                  <span className="text-3xl font-extrabold text-text-primary">
                    {formatTZS(recentBill.amount)}
                  </span>
                  <span className="text-xs text-text-secondary ml-1 block mt-1">
                    Invoice due for period: {recentBill.billing_period}.
                  </span>
                </div>
              ) : (
                <span className="text-sm text-text-secondary">No recent invoices found.</span>
              )}
              
              {recentBill && recentBill.status !== 'paid' ? (
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg bg-surface-container-low p-3 border border-outline/5">
                    <p className="text-xs text-text-secondary font-semibold">GePG Payment Control No</p>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-sm font-bold text-text-primary tracking-wide">
                        {recentBill.control_number || '994028374122'}
                      </code>
                      <Button variant="ghost" size="icon" onClick={copyPayNumber} className="h-8 w-8">
                        {copySuccess ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-text-secondary" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handlePayment} isLoading={payingState} className="w-full">
                    Pay Invoice via GePG / Mobile Money
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-primary font-bold text-sm bg-primary/10 p-3 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Account Balance Settled</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Button variant="outline" onClick={() => setActiveTab('tracking')} className="flex items-center justify-center space-x-2">
            <Compass className="h-4 w-4 text-primary" />
            <span>Track Waste Collection Truck</span>
          </Button>

          <Button variant="outline" onClick={() => setActiveTab('card')} className="flex items-center justify-center space-x-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span>Show Collector QR Card</span>
          </Button>

          <Button variant="outline" onClick={() => setActiveTab('reports')} className="flex items-center justify-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span>File Grievance Report</span>
          </Button>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Live GPS Status</h2>
          
          <div className="w-full h-48 bg-[#eef4fd] rounded-xl flex items-center justify-center border border-outline/10 shadow-inner relative">
            {nextSchedule ? (
              <div className="text-center p-4">
                <Truck className="h-10 w-10 mx-auto text-primary animate-bounce" />
                <p className="text-xs font-bold text-text-primary mt-2">
                  Truck: {nextSchedule.vehicle_plate} (Driver: {nextSchedule.driver_name})
                </p>
                <p className="text-[10px] text-text-secondary mt-1">
                  Estimated arrival time: {nextSchedule.estimated_arrival} on {nextSchedule.collection_date}
                </p>
              </div>
            ) : (
              <div className="text-center p-4 text-xs text-text-secondary">
                No active schedules or garbage trucks dispatched for your street today.
              </div>
            )}
          </div>

          {nextSchedule && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => toast.info('Calling Driver', `Simulating call to driver ${nextSchedule.driver_name}`)} className="flex-1">
                <Phone className="h-4 w-4 mr-2" /> Call Driver
              </Button>
              <Button 
                variant={alertNotify ? 'outline' : 'default'}
                onClick={() => {
                  setAlertNotify(!alertNotify);
                  toast.success('Alert Set', 'You will be notified when truck is 200m away.');
                }}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" /> {alertNotify ? 'Alert Active' : 'Alert Me'}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Report Issue</h2>
          <div className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline/10 shadow-xs">
            <div>
              <label className="text-xs font-bold block mb-1">Issue Category</label>
              <select 
                value={complaintType} 
                onChange={(e) => setComplaintType(e.target.value)}
                className="w-full bg-surface-container-low border border-outline/10 h-10 px-3 rounded-lg text-sm"
              >
                <option value="illegal_dumping">Illegal Dumping</option>
                <option value="overflowing_bin">Overflowing Bin</option>
                <option value="missed_collection">Missed Collection</option>
                <option value="damaged_container">Damaged Bin Container</option>
                <option value="other">Other / Request</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold block mb-1">Description</label>
              <textarea 
                rows={3}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Details of complaint addressed to TMWA..."
                className="w-full bg-surface-container-low border border-outline/10 p-3 rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { 
                  setLocationAcquired(true); 
                  setReportLoc('-6.7924, 39.2083 (Kariakoo)'); 
                }} 
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-1.5" /> {locationAcquired ? 'GPS Fixed' : 'Get Location'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-1.5" /> Add Photo
              </Button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            {imageFile && (
              <p className="text-[10px] text-primary font-semibold">
                Photo selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
              </p>
            )}

            <div className="text-[10px] text-text-secondary bg-surface-container-low p-2 rounded-lg">
              Coordinates: {reportLoc}
            </div>
          </div>
          <Button type="submit" isLoading={submitComplaint.isPending} disabled={!reportDesc.trim()}>
            Submit Grievance Report
          </Button>
        </form>
      )}

      {activeTab === 'card' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-lg font-bold">My Service Card</h2>
          <div className="bg-gradient-to-br from-primary to-primary-container text-white w-full p-6 rounded-2xl shadow-xl flex flex-col gap-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <p className="text-[9px] tracking-wider text-primary-container font-mono">TANZANIA WASTE AUTHORITY</p>
                <h4 className="text-base font-bold mt-1">{citizenProfile?.full_name || 'Elias Mwakalebela'}</h4>
              </div>
              <Badge variant="outline" className="text-white border-white/30">ACTIVE</Badge>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-inner w-36 h-36 mx-auto flex items-center justify-center text-text-primary">
              <QrCode className="h-28 w-28 text-black" />
            </div>
            
            <div className="flex justify-between text-left font-mono text-xs">
              <div>
                <p className="text-[8px] text-primary-container">MEMBER NO</p>
                <p className="font-bold">WST-{citizenProfile?.id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-primary-container">ZONE</p>
                <p className="font-bold">DSM-MUNICIPALITY</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
