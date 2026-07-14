'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePayments } from '@/hooks/usePayments';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { formatTZS, formatDate } from '@/utils/format';
import { toast } from '@/utils/toast';
import { Copy, Check, Lock, Receipt, Clock, CreditCard, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

const PAYMENT_METHODS = [
  { id: 'mpesa',    label: 'M-Pesa',      color: 'text-red-500',    bg: 'bg-red-50',   border: 'border-red-200' },
  { id: 'tigopesa', label: 'Tigo Pesa',   color: 'text-blue-500',   bg: 'bg-blue-50',  border: 'border-blue-200' },
  { id: 'airtel',  label: 'Airtel Money', color: 'text-red-600',    bg: 'bg-red-50',   border: 'border-red-100' },
  { id: 'gepg',    label: 'GePG',         color: 'text-gray-500',   bg: 'bg-gray-50',  border: 'border-gray-200' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 } })
};

export default function CitizenPaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { bills = [], isLoading, makePayment } = usePayments(user?.id);
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);

  const pendingBill = bills.find(b => b.status !== 'paid');
  const recentBill = bills[0];
  const bill = pendingBill ?? recentBill;

  const handleCopy = () => {
    if (bill?.control_number) {
      navigator.clipboard?.writeText(bill.control_number);
      setCopyId(bill.id);
      setTimeout(() => setCopyId(null), 2000);
      toast.success('Copied!', 'Control number copied to clipboard.');
    }
  };

  const handlePay = async () => {
    if (!bill) return;
    setPayingId(bill.id);
    try {
      await makePayment.mutateAsync({
        billingId: bill.id,
        amount: bill.amount,
        provider: selectedMethod as any,
        paymentMethod: selectedMethod,
        transactionReference: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
      toast.success('Payment Initiated', 'Check your mobile for confirmation.');
    } catch { /* handled in hook */ }
    finally { setPayingId(null); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf8fb] text-on-surface">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 pt-14 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Service Payment</h1>
          {bill && (
            <p className="text-sm text-on-surface/50 mt-0.5">{bill.billing_period}</p>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 px-5 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col gap-4 mt-4">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />)}
          </div>
        ) : !bill ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-on-surface/30" />
            </div>
            <p className="text-base font-semibold text-on-surface">No billing records</p>
            <p className="text-sm text-on-surface/50 max-w-xs">Your invoices will appear here once issued by the authority.</p>
          </div>
        ) : (
          <>
            {/* Control Number */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl shadow-sm p-5 border border-outline-variant/20"
            >
              <p className="text-xs font-semibold text-on-surface/50 mb-3">Control Number</p>
              <div className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-3">
                <div>
                  <code className="text-lg font-bold text-on-surface tracking-wide">
                    {bill.control_number ?? '—'}
                  </code>
                  <p className="text-xs text-on-surface/40 mt-0.5">Use this control number to pay via GePG</p>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopy} 
                  className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shadow-sm">
                  {copyId === bill.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>
            </motion.div>

            {/* Amount summary */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl shadow-sm p-5 border border-outline-variant/20 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-on-surface/50 font-medium">Amount Due</p>
                <p className="text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">{formatTZS(bill.amount)}</p>
                <p className="text-xs text-on-surface/40 mt-1">Due {formatDate(bill.due_date)}</p>
              </div>
              <span className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold uppercase',
                bill.status === 'paid' ? 'bg-[#cce6d0] text-[#0f5238]' : 'bg-orange-100 text-orange-700'
              )}>
                {bill.status === 'paid' ? 'Paid' : 'Due'}
              </span>
            </motion.div>

            {/* Select Payment Method */}
            {bill.status !== 'paid' && (
              <>
                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                  <p className="text-base font-bold text-on-surface mb-3">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <motion.button
                        key={method.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          'p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200',
                          selectedMethod === method.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : `${method.bg} ${method.border} border`
                        )}
                      >
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', method.bg, method.color)}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-on-surface">{method.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Pay Now */}
                <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePay}
                    disabled={!!payingId}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                  >
                    {payingId ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Lock className="w-5 h-5" /> Pay Now</>
                    )}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="w-full h-12 bg-surface-container text-on-surface rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border border-outline-variant/20"
                    onClick={() => toast.info('Receipt', 'Your receipt will be emailed to you after payment.')}
                  >
                    <Receipt className="w-4 h-4 text-primary" /> Generate Receipt
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="w-full h-12 bg-surface-container text-on-surface rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border border-outline-variant/20"
                    onClick={() => {}}
                  >
                    <Clock className="w-4 h-4 text-primary" /> Payment History
                  </motion.button>
                </motion.div>
              </>
            )}

            {/* Paid state */}
            {bill.status === 'paid' && (
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
                className="bg-[#cce6d0] text-[#0f5238] rounded-2xl p-5 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#0f5238]/10 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Payment Confirmed</p>
                  <p className="text-xs opacity-70 mt-0.5">Paid on {formatDate(bill.payment_transactions?.[0]?.paid_at ?? bill.due_date)}</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      <MobileBottomNav role="citizen" />
    </div>
  );
}
