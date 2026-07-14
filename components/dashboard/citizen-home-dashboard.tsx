'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { usePayments } from '@/hooks/usePayments';
import { useVehicleSimulation } from '@/hooks/useVehicleSimulation';
import { useProximityTracking } from '@/hooks/useProximityTracking';
import { ProximityHUD } from '@/components/tracking/proximity-hud';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { ErrorDisplay } from '@/components/error-boundary';
import { formatTZS, formatDate } from '@/utils/format';
import { toast } from '@/utils/toast';
import {
  AlertTriangle, History,
  MapPin, Bell, CheckCircle2, Receipt,
  Recycle, Radar, Calendar,
} from 'lucide-react';
import { cn } from '@/utils/cn';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Habari ya asubuhi';
  if (h < 17) return 'Habari ya mchana';
  return 'Habari ya jioni';
}

function getFirstName(name?: string | null) {
  if (!name) return 'Friend';
  return name.split(' ')[0];
}

function getDaysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }
  })
};

export function CitizenHomeDashboard({ user, profile, initialData }: { user: any; profile: any; initialData: any }) {
  const router = useRouter();
  const { data: dashboardData, isLoading, error, refetch } = useCitizenDashboard(user?.id, initialData);
  const { makePayment } = usePayments(user?.id);
  const [payingState, setPayingState] = useState(false);

  const citizenProfile = dashboardData?.profile;
  const recentBill = dashboardData?.recent_bills?.[0];
  const nextSchedule = dashboardData?.next_schedule;
  const firstName = getFirstName(profile?.full_name ?? citizenProfile?.full_name);
  const isPaid = recentBill?.status === 'paid';
  const hasBill = !!recentBill;
  const daysUntil = getDaysUntil(nextSchedule?.collection_date);
  const greeting = getGreeting();

  // Proximity tracking: GPS tagging, Haversine distance, ETA, push notifications
  // Step 1: get proximity state (reads homeLocation from localStorage immediately)
  // Step 2: pass homeLocation to vehicle simulation so TRUCK-001 moves toward citizen
  // Step 3: re-compute proximity with live vehicle positions
  const proximityInit = useProximityTracking([], nextSchedule?.vehicle_plate ?? undefined);
  const vehicles = useVehicleSimulation(proximityInit.homeLocation);
  const proximityWithVehicles = useProximityTracking(vehicles, nextSchedule?.vehicle_plate ?? undefined);
  // Expose the full state (tagHomeLocation, clearHomeLocation from init; distances from live)
  const proximity = {
    ...proximityInit,
    distanceKm: proximityWithVehicles.distanceKm,
    etaMinutes: proximityWithVehicles.etaMinutes,
    isWithinRadius: proximityWithVehicles.isWithinRadius,
    nearestTruck: proximityWithVehicles.nearestTruck,
  };

  const handlePayment = useCallback(async () => {
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
      toast.success('Payment Initiated', 'Check your M-Pesa for confirmation.');
    } catch { /* handled in hook */ }
    finally { setPayingState(false); }
  }, [recentBill, makePayment]);

  if (error) return (
    <div className="flex flex-col h-screen bg-[#fcf8fb]">
      <div className="flex-1 flex items-center justify-center p-4">
        <ErrorDisplay error={error as Error} onRetry={refetch} />
      </div>
      <MobileBottomNav role="citizen" />
    </div>
  );

  const quickActions = [
    { label: 'Pay Fee',      icon: <Receipt className="w-6 h-6" />,          bg: 'bg-secondary-container', text: 'text-on-secondary-container', action: () => router.push('/citizen/payments') },
    { label: 'Track Truck',  icon: <Radar className="w-6 h-6" />,            bg: 'bg-tertiary-container',  text: 'text-on-tertiary-container',  action: () => router.push('/citizen/tracking') },
    { label: 'Report Issue', icon: <AlertTriangle className="w-6 h-6" />,    bg: 'bg-error-container',     text: 'text-on-error-container',     action: () => router.push('/citizen/complaints') },
    { label: 'View History', icon: <History className="w-6 h-6" />,          bg: 'bg-surface-container-high', text: 'text-on-surface-variant',  action: () => router.push('/citizen/payments') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf8fb] text-on-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#fcf8fb]/80 shadow-sm flex justify-between items-center px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {firstName[0]}
          </div>
          <div>
            <p className="text-xs text-on-surface/50 font-medium leading-none">Mbeya, TZ</p>
            <p className="text-sm font-bold text-on-surface leading-tight">
              {nextSchedule?.zone_name ?? citizenProfile?.zone_name ?? 'Zone 4'}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => toast.info('Notifications', 'No new notifications.')}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <Bell className="w-5 h-5" />
        </motion.button>
      </header>

      <main className="pt-24 pb-28 px-5 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Greeting */}
        <motion.section custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            {greeting}, {firstName}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-on-surface/50 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{citizenProfile?.street_name ?? nextSchedule?.route_name ?? 'Your Zone'}</span>
          </div>
        </motion.section>

        {/* Live Proximity HUD — GPS tracking, distance, ETA, 5km alert */}
        <motion.section custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <ProximityHUD proximity={proximityWithVehicles} />
        </motion.section>

        {/* Hero Card — Next Collection */}
        <motion.section custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-br from-primary-container to-[#2d6a4f] p-6 rounded-2xl shadow-lg relative overflow-hidden text-on-primary-container">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-on-primary-container opacity-10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Next Collection</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Recycle className="w-4 h-4 text-white" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-10 w-32 bg-white/20 rounded-lg animate-pulse" />
              ) : daysUntil !== null ? (
                <>
                  <p className="text-5xl font-extrabold text-white drop-shadow-sm tracking-tight leading-none mt-2">
                    {daysUntil <= 0 ? 'Today' : `${daysUntil} Day${daysUntil !== 1 ? 's' : ''}`}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white/90 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{nextSchedule?.collection_date ? formatDate(nextSchedule.collection_date) : 'Scheduled soon'}</span>
                  </div>
                </>
              ) : (
                <p className="text-2xl font-bold text-white mt-2">Not yet scheduled</p>
              )}
            </div>
          </div>
        </motion.section>


        {/* Quick Action Grid */}
        <motion.section custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center gap-3 border border-outline-variant/10 hover:bg-surface-container-low transition-colors"
              >
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', action.bg, action.text)}>
                  {action.icon}
                </div>
                <span className="text-sm font-semibold text-on-surface">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Payment Status */}
        <motion.section custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white rounded-2xl shadow-sm p-5 flex justify-between items-center border border-outline-variant/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Payment Status</p>
                {hasBill && (
                  <p className="text-xs text-on-surface/50 mt-0.5">
                    {isPaid ? `Paid · ${formatDate(recentBill?.payment_transactions?.[0]?.paid_at ?? recentBill?.due_date)}` : `Due · ${formatTZS(recentBill?.amount)}`}
                  </p>
                )}
              </div>
            </div>
            {isPaid ? (
              <div className="bg-[#cce6d0] text-[#0f5238] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
              </div>
            ) : hasBill ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handlePayment}
                disabled={payingState}
                className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
              >
                {payingState ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Pay Now'}
              </motion.button>
            ) : (
              <span className="text-xs text-on-surface/40 font-medium">No bill</span>
            )}
          </div>
        </motion.section>
      </main>

      <MobileBottomNav role="citizen" />
    </div>
  );
}
