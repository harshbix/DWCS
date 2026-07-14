'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCitizenDashboard } from '@/hooks/useCitizenDashboard';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  ChevronLeft, Calendar, Truck, MapPin, Clock, User,
  CheckCircle2, Circle, AlertCircle, CheckCheck,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 } })
};

const CHECKLIST = [
  'Place bins at designated collection point',
  'Separate organic and inorganic waste',
  'Ensure bins are accessible from the road',
  'Mark your bin with your household ID',
];

function getDaysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const STEPS = [
  { label: 'Assigned', icon: <CheckCircle2 className="w-4 h-4" />, done: true },
  { label: 'Dispatched', icon: <AlertCircle className="w-4 h-4" />, done: false },
  { label: 'En Route', icon: <Circle className="w-4 h-4" />, done: false },
  { label: 'Completed', icon: <CheckCheck className="w-4 h-4" />, done: false },
];

export default function CitizenSchedulePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: dashboardData, isLoading } = useCitizenDashboard(user?.id);
  const nextSchedule = dashboardData?.next_schedule;
  const daysUntil = getDaysUntil(nextSchedule?.collection_date);

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf8fb] text-on-surface">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 pt-14 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">Collection Schedule</h1>
          <p className="text-xs text-on-surface/50 mt-0.5">Upcoming waste collection</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 px-5 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-surface-container animate-pulse" />)}
          </div>
        ) : !nextSchedule ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
              <Calendar className="w-8 h-8 text-on-surface/30" />
            </div>
            <p className="text-base font-semibold text-on-surface">No upcoming collection</p>
            <p className="text-sm text-on-surface/50 max-w-xs">
              Your next scheduled collection will appear here once assigned by the municipal authority.
            </p>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-gradient-to-br from-primary-container to-[#2d6a4f] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white opacity-5 rounded-full" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Next Collection</p>
                  <p className="text-5xl font-extrabold tracking-tight leading-none">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? '1 Day' : daysUntil !== null ? `${daysUntil} Days` : 'Soon'}
                  </p>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-3">
                    <Calendar className="w-4 h-4" />
                    <span>{nextSchedule.collection_date ? formatDate(nextSchedule.collection_date) : 'Date TBC'}</span>
                  </div>
                  {nextSchedule.estimated_arrival && (
                    <div className="flex items-center gap-2 text-white/70 text-xs mt-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Est. arrival: {nextSchedule.estimated_arrival}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Driver / Vehicle Card */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface/40">Assigned Crew</p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                    {nextSchedule.driver_name?.substring(0, 2).toUpperCase() ?? 'DR'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface">{nextSchedule.driver_name ?? 'Assigned Driver'}</p>
                    <p className="text-xs text-on-surface/50 mt-0.5">Municipal Waste Collector</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-[9px] text-on-surface/40 font-medium uppercase">Vehicle</p>
                      <p className="text-xs font-bold text-on-surface">{nextSchedule.vehicle_plate ?? '—'}</p>
                    </div>
                  </div>
                  <div className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-[9px] text-on-surface/40 font-medium uppercase">Route</p>
                      <p className="text-xs font-bold text-on-surface truncate">{nextSchedule.route_name ?? '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Progress Steps */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-4">Collection Status</p>
                <div className="grid grid-cols-4 gap-2">
                  {STEPS.map((step, idx) => (
                    <div key={step.label} className="flex flex-col items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                        step.done ? 'bg-primary text-white' : 'bg-surface-container text-on-surface/30'
                      )}>
                        {step.icon}
                      </div>
                      <div className={cn('h-1 w-full rounded-full', step.done ? 'bg-primary' : 'bg-surface-container-high')} />
                      <p className="text-[9px] font-bold text-on-surface/50 text-center leading-tight">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Preparation Checklist */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-4">Preparation Checklist</p>
                <div className="flex flex-col gap-3">
                  {CHECKLIST.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-primary/30 flex-shrink-0" />
                      <p className="text-sm text-on-surface/70">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </main>

      <MobileBottomNav role="citizen" />
    </div>
  );
}
