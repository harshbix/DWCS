'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePayments } from '@/hooks/usePayments';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-boundary';
import { formatTZS, formatDate } from '@/utils/format';
import { Copy, Check, CheckCircle2, CreditCard } from 'lucide-react';

export default function CitizenPaymentsPage() {
  const { user } = useAuth();
  const { bills = [], isLoading, error, refetch, makePayment } = usePayments(user?.id);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);

  const handlePay = async (bill: { id: string; amount: number; control_number: string | null }) => {
    setPayingId(bill.id);
    try {
      await makePayment.mutateAsync({
        billingId: bill.id,
        amount: bill.amount,
        provider: 'gepg',
        paymentMethod: 'mpesa',
        transactionReference: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
    } catch { /* error handled in hook */ } finally {
      setPayingId(null);
    }
  };

  const handleCopy = (bill: { id: string; control_number: string | null }) => {
    if (bill.control_number) {
      navigator.clipboard?.writeText(bill.control_number);
      setCopyId(bill.id);
      setTimeout(() => setCopyId(null), 2000);
    }
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
            <div>
              <h1 className="text-xl font-bold text-text-primary">Billing & Payments</h1>
              <p className="text-xs text-text-secondary mt-0.5">Municipal waste collection invoices</p>
            </div>

            {bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center p-6">
                <CreditCard className="h-10 w-10 text-outline" />
                <p className="text-sm font-semibold text-text-primary">No billing records</p>
                <p className="text-xs text-text-secondary">Your invoices will appear here once issued.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bills.map((bill) => (
                  <Card key={bill.id}>
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-text-secondary">Period: {bill.billing_period}</p>
                          <p className="text-2xl font-extrabold text-text-primary mt-0.5">{formatTZS(bill.amount)}</p>
                          <p className="text-[10px] text-text-secondary">Due: {formatDate(bill.due_date)}</p>
                        </div>
                        <Badge variant={bill.status === 'paid' ? 'success' : bill.status === 'failed' ? 'danger' : 'warning'}>
                          {bill.status}
                        </Badge>
                      </div>

                      {bill.status !== 'paid' && (
                        <>
                          {bill.control_number && (
                            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-2.5 border border-outline/5">
                              <div>
                                <p className="text-[9px] font-semibold text-text-secondary">GePG Control No.</p>
                                <code className="text-xs font-bold">{bill.control_number}</code>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(bill)} className="h-7 w-7">
                                {copyId === bill.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          )}
                          <Button
                            onClick={() => handlePay(bill)}
                            isLoading={payingId === bill.id}
                            className="w-full"
                          >
                            Pay Now
                          </Button>
                        </>
                      )}

                      {bill.status === 'paid' && (
                        <div className="flex items-center gap-2 text-primary text-xs font-semibold bg-primary/10 p-2.5 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          Payment Confirmed
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <MobileBottomNav role="citizen" />
    </div>
  );
}
