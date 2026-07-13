'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { usePayments } from '@/hooks/usePayments';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ErrorDisplay } from '@/components/error-boundary';
import { formatTZS, formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';
import { MapProvider, useMap } from '@/components/map/map-provider';
import { MapComponent } from '@/components/map/map-component';
import { useMapStore } from '@/stores/map.store';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Truck,
  MapPin,
  Leaf,
  QrCode,
  ChevronUp,
  ChevronDown,
  Zap,
  Phone,
  Star,
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/cn';

const QUICK_ACTIONS = [
  {
    label: 'Schedule',
    icon: <CalendarClock className="h-5 w-5" />,
    href: '/citizen/schedule',
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/citizen/payments',
    color: 'bg-secondary-container text-on-secondary-container',
  },
  {
    label: 'Complaint',
    icon: <AlertTriangle className="h-5 w-5" />,
    href: '/citizen/complaints',
    color: 'bg-error-container text-on-error-container',
  },
  {
    label: 'My Card',
    icon: <QrCode className="h-5 w-5" />,
    href: '/citizen/profile',
    color: 'bg-tertiary-container text-on-tertiary-container',
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(fullName?: string | null): string {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

// Straight-line fallback distance
function getDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CitizenHomePage() {
  return (
    <MapProvider>
      <CitizenDashboardContent />
    </MapProvider>
  );
}

function CitizenDashboardContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { data: dashboardData, isLoading, error, refetch } = useCitizenDashboard(user?.id);
  const { makePayment } = usePayments(user?.id);
  const mapStore = useMapStore();
  const supabase = createBrowserSupabaseClient();

  const [copySuccess, setCopySuccess] = useState(false);
  const [payingState, setPayingState] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [truckLoc, setTruckLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [roadMetrics, setRoadMetrics] = useState<{ distanceKM: number; durationMin: number } | null>(null);

  // Set greeting client-side to prevent hydration mismatches
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const citizenProfile = dashboardData?.profile;
  const recentBill = dashboardData?.recent_bills?.[0];
  const nextSchedule = dashboardData?.next_schedule;
  const firstName = getFirstName(profile?.full_name ?? citizenProfile?.full_name);

  // ── Telemetry Real-time Subscription ──────────────────────────────────────
  useEffect(() => {
    if (!nextSchedule?.vehicle_id) return;

    const fetchVehicleLoc = async () => {
      const { data } = await supabase
        .from('vehicle_current_location')
        .select('latitude, longitude')
        .eq('vehicle_id', nextSchedule.vehicle_id)
        .single();
      if (data) {
        setTruckLoc({ lat: data.latitude, lng: data.longitude });
      }
    };

    fetchVehicleLoc();

    const channel = supabase
      .channel(`live-tracking-${nextSchedule.vehicle_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_current_location',
          filter: `vehicle_id=eq.${nextSchedule.vehicle_id}`,
        },
        (payload: any) => {
          const newLoc = payload.new;
          if (newLoc?.latitude && newLoc?.longitude) {
            setTruckLoc({ lat: newLoc.latitude, lng: newLoc.longitude });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nextSchedule?.vehicle_id]);

  // Fetch Road Snapped Distance & Duration from OSRM
  useEffect(() => {
    if (!truckLoc || !mapStore.userLocation) return;

    const fetchOSRMMetrics = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${mapStore.userLocation.lng},${mapStore.userLocation.lat};${truckLoc.lng},${truckLoc.lat}?overview=false`
        );
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          setRoadMetrics({
            distanceKM: route.distance / 1000,
            durationMin: Math.ceil(route.duration / 60),
          });
        }
      } catch (err) {
        console.error('Failed to fetch OSRM metrics:', err);
      }
    };

    fetchOSRMMetrics();
  }, [truckLoc, mapStore.userLocation]);

  // Sync markers to MapStore
  useEffect(() => {
    const centerCoords = truckLoc || mapStore.userLocation || { lat: -8.9000, lng: 33.4500 };
    mapStore.setCenter(centerCoords);

    const activeMarkers = [];
    if (truckLoc) {
      activeMarkers.push({
        id: nextSchedule?.vehicle_id || 'truck',
        type: 'truck' as const,
        position: truckLoc,
        title: `Waste Truck: ${nextSchedule?.vehicle_plate || ''}`,
        description: `Driver: ${nextSchedule?.driver_name || 'Assigned'}`,
      });
    }

    mapStore.setMarkers(activeMarkers);
  }, [truckLoc, mapStore.userLocation, nextSchedule]);

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
    } catch {
      /* handled in hook */
    } finally {
      setPayingState(false);
    }
  }, [recentBill, makePayment]);

  const copyPayNumber = useCallback(() => {
    if (recentBill?.control_number) {
      navigator.clipboard?.writeText(recentBill.control_number);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast.success('Copied!', 'Control number copied to clipboard.');
    }
  }, [recentBill?.control_number]);

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

  const isPaid = recentBill?.status === 'paid';
  const hasBill = !!recentBill;

  // Live distance and ETA calculations (snapped OSRM with Haversine fallback)
  let straightDistance = 0;
  if (truckLoc && mapStore.userLocation) {
    straightDistance = getDistanceKM(
      mapStore.userLocation.lat,
      mapStore.userLocation.lng,
      truckLoc.lat,
      truckLoc.lng
    );
  }
  const finalDistance = roadMetrics?.distanceKM ?? straightDistance;
  const finalETA = roadMetrics?.durationMin ?? Math.round((straightDistance / 25) * 60);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <div className="absolute top-0 inset-x-0 z-[1001]">
        <TopNavigation />
      </div>

      {/* Full-Screen Map domination */}
      <div className="w-full h-full absolute inset-0 z-0">
        <MapComponent showControls={true} />
      </div>

      {/* Uber/Bolt Style Floating ETA Card */}
      {truckLoc && (
        <div className="absolute top-20 left-4 right-4 z-[1000] p-4 bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl border border-outline/10 shadow-lg flex items-center justify-between animate-fade-slide-up">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <Truck className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Waste Truck approaching</p>
              <p className="text-[10px] text-on-surface/50 mt-0.5">
                {finalDistance > 0.1 ? `${finalDistance.toFixed(1)} km remaining` : 'Arriving at your street'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-extrabold text-primary block leading-none">
              {finalETA > 0 ? `${finalETA} min` : 'Arrived'}
            </span>
            <span className="text-[9px] text-on-surface/40 uppercase tracking-wider font-semibold">ETA</span>
          </div>
        </div>
      )}

      {/* Apple Maps Style spring-physics expandable Bottom Sheet */}
      <motion.div
        initial={{ y: '75%' }}
        animate={{ y: isExpanded ? '15%' : '72%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="absolute inset-x-0 bottom-0 z-[1000] bg-surface-container-lowest/95 backdrop-blur-md rounded-t-[32px] shadow-2xl border-t border-outline/10 p-5 flex flex-col cursor-pointer pb-24"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-outline/20 rounded-full mx-auto mb-4 shrink-0" />

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[10px] text-on-surface/50 font-medium uppercase tracking-wider">
              {greeting || 'Welcome'}{firstName ? `, ${firstName}` : ''}
            </p>
            <h2 className="text-lg font-extrabold text-on-surface leading-tight mt-0.5">
              EcoCollect Portal
            </h2>
          </div>
          <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface/60">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] select-text" onClick={(e) => isExpanded && e.stopPropagation()}>
          
          {/* Driver Approaching Profile (Uber style) */}
          {nextSchedule && (
            <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/45 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
                  {nextSchedule.driver_name?.substring(0, 2).toUpperCase() || 'DR'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-on-surface truncate">{nextSchedule.driver_name || 'Assigned Driver'}</h3>
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-current" /> 4.9
                    </div>
                  </div>
                  <p className="text-[10px] text-on-surface/50 mt-0.5">
                    Plate: {nextSchedule.vehicle_plate} · Capacity: 8.5 Tons
                  </p>
                </div>
                <a
                  href="tel:+255789333444"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all shrink-0 cursor-pointer"
                  aria-label="Call driver"
                >
                  <Phone className="h-4.5 w-4.5" />
                </a>
              </div>

              {/* Progress checklist bar */}
              <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-outline/5">
                {[
                  { label: 'Assigned', done: true },
                  { label: 'Approaching', done: !!truckLoc },
                  { label: 'Collecting', done: false },
                  { label: 'Completed', done: false },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className={cn('h-1.5 rounded-full', step.done ? 'bg-primary' : 'bg-surface-container-high')} />
                    <span className="text-[8px] font-bold text-on-surface/55 text-center truncate">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing Settlement banner */}
          <div
            className={cn(
              'rounded-2xl px-4 py-3.5 flex items-center gap-3 border transition-colors',
              isPaid ? 'bg-primary/5 border-primary/10' : hasBill ? 'bg-orange-50/50 border-orange-100' : 'bg-surface-container/50 border-outline/5'
            )}
          >
            <div className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
              isPaid ? 'bg-primary/10' : hasBill ? 'bg-orange-100' : 'bg-surface-container'
            )}>
              {isPaid ? <CheckCircle2 className="h-5 w-5 text-primary" /> : hasBill ? <Zap className="h-5 w-5 text-orange-500" /> : <Leaf className="h-5 w-5 text-on-surface/30" />}
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">
                {isPaid ? 'Account settled' : hasBill ? 'Payment due' : 'No active invoices'}
              </p>
              <p className="text-[10px] text-on-surface/50 mt-0.5">
                {isPaid
                  ? `Paid on ${formatDate(recentBill?.updated_at)}`
                  : hasBill
                  ? `${formatTZS(recentBill?.amount)} · Due ${formatDate(recentBill?.due_date)}`
                  : 'Your account is up to date'}
              </p>
            </div>
          </div>

          {/* Services Actions Grid */}
          <div className="mt-1">
            <p className="text-[9px] font-bold text-on-surface/40 uppercase tracking-widest mb-2.5">
              Services
            </p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.href}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-outline/10 bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-150 shadow-sm"
                >
                  <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', action.color)}>
                    {action.icon}
                  </div>
                  <span className="text-[9px] font-bold text-on-surface/70 text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Card when expanded */}
          {hasBill && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-4 mt-1 shadow-sm"
            >
              <p className="text-[9px] font-bold text-on-surface/40 uppercase tracking-widest mb-3">
                Monthly Invoice Details
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                    {formatTZS(recentBill.amount)}
                  </span>
                  <p className="text-[10px] text-on-surface/50 mt-0.5">
                    {recentBill.billing_period} · Due {formatDate(recentBill.due_date)}
                  </p>
                </div>
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                  isPaid ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-700'
                )}>
                  {isPaid ? 'Paid' : 'Due'}
                </span>
              </div>

              {!isPaid && (
                <div className="mt-4 flex flex-col gap-2">
                  {recentBill.control_number && (
                    <div className="flex items-center justify-between rounded-xl bg-surface-container px-3.5 py-2">
                      <div>
                        <p className="text-[8px] text-on-surface/50 font-semibold uppercase tracking-wider">
                          GePG Control No.
                        </p>
                        <code className="text-xs font-bold text-on-surface tracking-wide">
                          {recentBill.control_number}
                        </code>
                      </div>
                      <button
                        onClick={copyPayNumber}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors"
                      >
                        {copySuccess ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-on-surface/40" />}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handlePayment}
                    disabled={payingState}
                    className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/95 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {payingState ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Pay via GePG / Mobile Money
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </motion.div>

      <div className="absolute bottom-0 inset-x-0 z-[1001]">
        <MobileBottomNav role="citizen" />
      </div>
    </div>
  );
}
