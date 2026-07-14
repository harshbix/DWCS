import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Phone, Star, CheckCircle2, Zap, Leaf, Copy, Check, CreditCard } from 'lucide-react';
import { formatTZS, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/navigation';
import { EcoGamification } from './eco-gamification';

interface CitizenBottomSheetProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  greeting: string;
  firstName: string;
  nextSchedule: any;
  truckLoc: any;
  isPaid: boolean;
  hasBill: boolean;
  recentBill: any;
  quickActions: any[];
  copySuccess: boolean;
  copyPayNumber: () => void;
  payingState: boolean;
  handlePayment: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function CitizenBottomSheet({
  isExpanded,
  setIsExpanded,
  greeting,
  firstName,
  nextSchedule,
  truckLoc,
  isPaid,
  hasBill,
  recentBill,
  quickActions,
  copySuccess,
  copyPayNumber,
  payingState,
  handlePayment
}: CitizenBottomSheetProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ y: '75%' }}
      animate={{ y: isExpanded ? '15%' : '72%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="absolute inset-x-0 bottom-0 z-[1000] bg-surface-container-lowest/95 backdrop-blur-md rounded-t-[32px] shadow-2xl border-t border-outline/10 p-5 flex flex-col cursor-pointer pb-24"
      onClick={() => setIsExpanded(!isExpanded)}
    >
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

      <motion.div 
        className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] select-text no-scrollbar" 
        onClick={(e) => isExpanded && e.stopPropagation()}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            >
              <EcoGamification />
            </motion.div>
          )}
        </AnimatePresence>
        
        {nextSchedule && (
          <motion.div variants={itemVariants} className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-4 flex flex-col gap-3 shadow-sm">
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
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="tel:+255789333444"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all shrink-0 cursor-pointer"
                aria-label="Call driver"
              >
                <Phone className="h-4.5 w-4.5" />
              </motion.a>
            </div>

            <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-outline/5">
              {[
                { label: 'Assigned', done: true },
                { label: 'Approaching', done: !!truckLoc },
                { label: 'Collecting', done: false },
                { label: 'Completed', done: false },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className={cn('h-1.5 rounded-full transition-colors duration-500', step.done ? 'bg-primary' : 'bg-surface-container-high')} />
                  <span className="text-[8px] font-bold text-on-surface/55 text-center truncate">{step.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className={cn(
            'rounded-2xl px-4 py-3.5 flex items-center gap-3 border transition-colors duration-300',
            isPaid ? 'bg-primary/5 border-primary/10' : hasBill ? 'bg-orange-50/50 border-orange-100' : 'bg-surface-container/50 border-outline/5'
          )}
        >
          <div className={cn(
            'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300',
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
        </motion.div>

        <motion.div variants={itemVariants} className="mt-1">
          <p className="text-[9px] font-bold text-on-surface/40 uppercase tracking-widest mb-2.5">
            Services
          </p>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-outline/10 bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-sm"
              >
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', action.color)}>
                  {action.icon}
                </div>
                <span className="text-[9px] font-bold text-on-surface/70 text-center leading-tight">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {hasBill && isExpanded && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={copyPayNumber}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      {copySuccess ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-on-surface/40" />}
                    </motion.button>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handlePayment}
                  disabled={payingState}
                  className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/95 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {payingState ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay via GePG / Mobile Money
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

      </motion.div>
    </motion.div>
  );
}
