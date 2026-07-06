'use client';

import React, { useState } from 'react';
import { 
  CreditCard, History, MapPin, AlertTriangle, CheckCircle2, 
  X, Truck, Copy, Check, ExternalLink, Camera, Compass, 
  Send, Phone, Bell, User, QrCode 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { toast } from '@/utils/toast';
import { formatTZS, formatDate } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CitizenPortalProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * Citizen Portal UI Sub-shell.
 */
export function CitizenPortal({ activeTab, setActiveTab }: CitizenPortalProps) {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAsRead } = useNotificationStore();

  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Overdue'>('Overdue');
  const [copySuccess, setCopySuccess] = useState(false);
  const [payingState, setPayingState] = useState(false);
  const [alertNotify, setAlertNotify] = useState(false);

  // Form States
  const [reportType, setReportType] = useState('Dumping');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoc, setReportLoc] = useState('Plot 42, Block G, Upanga South');
  const [locationAcquired, setLocationAcquired] = useState(false);

  const handlePayment = () => {
    setPayingState(true);
    setTimeout(() => {
      setPayingState(false);
      setPaymentStatus('Paid');
      toast.success('Payment Received', 'Invoice paid successfully via Mobile Money.');
      setActiveTab('home');
    }, 1200);
  };

  const copyPayNumber = () => {
    navigator.clipboard?.writeText('994028374122');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 select-none max-w-md mx-auto">
      {/* Tab Select Header */}
      <div className="flex items-center justify-between border-b border-outline/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Citizen Hub</h1>
          <p className="text-xs text-text-secondary">Zone: {user?.zone || 'Unassigned'}</p>
        </div>
        <Badge variant={paymentStatus === 'Paid' ? 'success' : 'danger'}>
          {paymentStatus} Status
        </Badge>
      </div>

      {/* Dynamic Content Views */}
      {activeTab === 'home' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Monthly Utility Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <span className="text-3xl font-extrabold text-text-primary">
                  {formatTZS(12500)}
                </span>
                <span className="text-xs text-text-secondary ml-1 block mt-1">
                  Invoice due for October 2023 collection cycles.
                </span>
              </div>
              
              {paymentStatus === 'Overdue' ? (
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg bg-surface-container-low p-3 border border-outline/5">
                    <p className="text-xs text-text-secondary font-semibold">GePG Payment Number</p>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-sm font-bold text-text-primary tracking-wide">994028374122</code>
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
          
          {/* Simulated Map placeholder */}
          <div className="w-full h-48 bg-[#eef4fd] rounded-xl flex items-center justify-center border border-outline/10 shadow-inner relative">
            <div className="text-center">
              <Truck className="h-10 w-10 mx-auto text-primary animate-bounce" />
              <p className="text-xs font-bold text-text-primary mt-2">Truck #TZ-402 (Mbezi-Upanga Route)</p>
              <p className="text-[10px] text-text-secondary">Arriving in approx 12 minutes (2.4 km away)</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => toast.info('Calling Driver', 'Simulating call to driver Alex at +255 744 333 999')} className="flex-1">
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
        </div>
      )}

      {activeTab === 'reports' && (
        <form onSubmit={(e) => { e.preventDefault(); toast.success('Report Filed', 'Grievance submitted successfully to dispatch.'); setReportDesc(''); }} className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Report Issue</h2>
          <div className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline/10 shadow-xs">
            <div>
              <label className="text-xs font-bold block mb-1">Issue Category</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-surface-container-low border border-outline/10 h-10 px-3 rounded-lg text-sm"
              >
                <option value="Dumping">Illegal Dumping</option>
                <option value="Overflowing Bin">Overflowing Bin</option>
                <option value="Missed Collection">Missed Collection</option>
                <option value="Other">Other / Request</option>
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
              <Button type="button" variant="outline" onClick={() => { setLocationAcquired(true); setReportLoc('-6.7915, 39.2312 (Kariakoo North)'); }} className="flex-1">
                <MapPin className="h-4 w-4 mr-1.5" /> {locationAcquired ? 'GPS Fixed' : 'Get Location'}
              </Button>
              <Button type="button" variant="outline" onClick={() => toast.success('Camera', 'Photo snapshot added.')} className="flex-1">
                <Camera className="h-4 w-4 mr-1.5" /> Add Photo
              </Button>
            </div>
            <div className="text-[10px] text-text-secondary bg-surface-container-low p-2 rounded-lg">
              Coordinates: {reportLoc}
            </div>
          </div>
          <Button type="submit" disabled={!reportDesc.trim()}>Submit Grievance Report</Button>
        </form>
      )}

      {activeTab === 'card' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-lg font-bold">My Service Card</h2>
          <div className="bg-gradient-to-br from-primary to-primary-container text-white w-full p-6 rounded-2xl shadow-xl flex flex-col gap-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <p className="text-[9px] tracking-wider text-primary-container font-mono">TANZANIA WASTE AUTHORITY</p>
                <h4 className="text-base font-bold mt-1">Elias Mwakalebela</h4>
              </div>
              <Badge variant="outline" className="text-white border-white/30">ACTIVE</Badge>
            </div>
            {/* Mock QR container */}
            <div className="bg-white p-4 rounded-xl shadow-inner w-36 h-36 mx-auto flex items-center justify-center text-text-primary">
              <QrCode className="h-28 w-28 text-black" />
            </div>
            <div className="flex justify-between text-left font-mono text-xs">
              <div>
                <p className="text-[8px] text-primary-container">MEMBER NO</p>
                <p className="font-bold">WST-29402</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-primary-container">ZONE</p>
                <p className="font-bold">ZONE-4 UPANGA</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
