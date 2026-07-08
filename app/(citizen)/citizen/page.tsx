'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { usePayments } from '@/hooks/usePayments';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { formatTZS, formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';
import {
  CreditCard, CalendarClock, AlertTriangle, CheckCircle2,
  Copy, Check, Compass, QrCode, Truck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/utils/toast';

export default function CitizenHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useCitizenDashboard(user?.id);
  const { makePayment } = usePayments(user?.id);

  const [copySuccess, setCopySuccess] = useState(false);
  const [payingState, setPayingState] = useState(false);

  const citizenProfile = dashboardData?.profile;
  const recentBill = dashboardData?.recent_bills?.[0];
  const nextSchedule = dashboardData?.next_schedule;

  if (isLoading) return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto">
        <SkeletonDashboard />
      </main>
      <MobileBottomNav role="citizen" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto flex items-center justify-center">
        <ErrorDisplay error={error as Error} onRetry={refetch} />
      </main>
      <MobileBottomNav role="citizen" />
    </div>
  );

  const handlePayment = async () => {
    if (!recentBill) return;
    setPayingState(true);
    try {
      await makePayment.mutateAsync({
        billingId: recentBill.id,
        amount: recentBill.amount,
        provider: 'gepg',
        paymentMethod: 'mpesa',
        transactionReference: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
    } catch {
      /* error handled in hook */
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Citizen Hub</h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {citizenProfile?.address || 'EcoCollect Tanzania'}
              </p>
            </div>
            <Badge variant={recentBill?.status === 'paid' ? 'success' : 'danger'}>
              {recentBill?.status === 'paid' ? 'Paid' : recentBill ? 'Overdue' : 'No Invoice'}
            </Badge>
          </div>

          {/* Billing Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Monthly Utility Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {recentBill ? (
                <>
                  <div>
                    <span className="text-3xl font-extrabold text-text-primary">
                      {formatTZS(recentBill.amount)}
                    </span>
                    <span className="text-xs text-text-secondary ml-1 block mt-0.5">
                      Period: {recentBill.billing_period} · Due: {formatDate(recentBill.due_date)}
                    </span>
                  </div>
                  {recentBill.status !== 'paid' ? (
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg bg-surface-container-low p-3 border border-outline/5">
                        <p className="text-xs text-text-secondary font-semibold">GePG Control No.</p>
                        <div className="flex items-center justify-between mt-1">
                          <code className="text-sm font-bold text-text-primary tracking-wide">
                            {recentBill.control_number || '—'}
                          </code>
                          <Button variant="ghost" size="icon" onClick={copyPayNumber} className="h-7 w-7">
                            {copySuccess ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-text-secondary" />}
                          </Button>
                        </div>
                      </div>
                      <Button onClick={handlePayment} isLoading={payingState} className="w-full">
                        Pay via GePG / Mobile Money
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-primary font-bold text-sm bg-primary/10 p-3 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Account Balance Settled</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-text-secondary">No invoices found.</p>
              )}
            </CardContent>
          </Card>

          {/* Next Collection */}
          {nextSchedule && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">Next Collection</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    {nextSchedule.collection_date} · {nextSchedule.estimated_arrival}
                    {nextSchedule.driver_name && ` · ${nextSchedule.driver_name}`}
                  </p>
                </div>
                <Badge variant="outline">{nextSchedule.vehicle_plate}</Badge>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => router.push('/citizen/schedule')} className="h-20 flex-col gap-1.5">
              <CalendarClock className="h-5 w-5 text-primary" />
              <span className="text-xs">Schedule</span>
            </Button>
            <Button variant="outline" onClick={() => router.push('/citizen/payments')} className="h-20 flex-col gap-1.5">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-xs">Payments</span>
            </Button>
            <Button variant="outline" onClick={() => router.push('/citizen/complaints')} className="h-20 flex-col gap-1.5">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span className="text-xs">File Complaint</span>
            </Button>
            <Button variant="outline" onClick={() => router.push('/citizen/profile')} className="h-20 flex-col gap-1.5">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="text-xs">My Card</span>
            </Button>
          </div>
        </div>
      </main>
      <MobileBottomNav role="citizen" />
    </div>
  );
}
