'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { usePayments } from '@/hooks/usePayments';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { ErrorDisplay } from '@/components/error-boundary';
import { formatTZS, formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';
import { useMap } from '@/components/map/map-provider';
import { MapComponent } from '@/components/map/map-component';
import { useMapStore } from '@/stores/map.store';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import dynamic from 'next/dynamic';
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

const CitizenBottomSheet = dynamic(() => import('./citizen-bottom-sheet'), {
  ssr: false,
});

export function CitizenInteractiveDashboard({ user, profile, initialData }: { user: any, profile: any, initialData: any }) {
  const router = useRouter();
  const { data: dashboardData, isLoading, error, refetch } = useCitizenDashboard(user?.id, initialData);
  const { makePayment } = usePayments(user?.id);
  const mapStore = useMapStore();
  const supabase = createBrowserSupabaseClient();

  const [copySuccess, setCopySuccess] = useState(false);
  const [payingState, setPayingState] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [truckLoc, setTruckLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [roadMetrics, setRoadMetrics] = useState<{ distanceKM: number; durationMin: number } | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const citizenProfile = dashboardData?.profile;
  const recentBill = dashboardData?.recent_bills?.[0];
  const nextSchedule = dashboardData?.next_schedule;
  const firstName = getFirstName(profile?.full_name ?? citizenProfile?.full_name);

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
  }, [nextSchedule?.vehicle_id, supabase]);

  useEffect(() => {
    if (!truckLoc || !mapStore.userLocation) return;

    const fetchOSRMMetrics = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${mapStore.userLocation?.lng},${mapStore.userLocation?.lat};${truckLoc.lng},${truckLoc.lat}?overview=false`
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

      <div className="w-full h-full absolute inset-0 z-0">
        <MapComponent showControls={true} />
      </div>

      <AnimatePresence>
        {truckLoc && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.5 } }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-20 left-4 right-4 z-[1000] p-4 bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl border border-outline/10 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 relative"
              >
                <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-50" />
                <Truck className="h-5 w-5 relative z-10" />
              </motion.div>
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
          </motion.div>
        )}
      </AnimatePresence>

      <CitizenBottomSheet 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        greeting={greeting}
        firstName={firstName}
        nextSchedule={nextSchedule}
        truckLoc={truckLoc}
        isPaid={isPaid}
        hasBill={hasBill}
        recentBill={recentBill}
        quickActions={QUICK_ACTIONS}
        copySuccess={copySuccess}
        copyPayNumber={copyPayNumber}
        payingState={payingState}
        handlePayment={handlePayment}
      />

      <div className="absolute bottom-0 inset-x-0 z-[1001]">
        <MobileBottomNav role="citizen" />
      </div>
    </div>
  );
}
