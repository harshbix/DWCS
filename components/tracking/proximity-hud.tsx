'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Clock, Bell, BellOff, Navigation, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProximityState } from '@/hooks/useProximityTracking';
import { requestNotificationPermission } from '@/hooks/useProximityTracking';

interface ProximityHUDProps {
  proximity: ProximityState;
}

function DistanceRing({ distanceKm }: { distanceKm: number }) {
  // 0 km = 100% full, 20 km = 0% (cap at 20 km)
  const percent = Math.max(0, Math.min(100, ((20 - distanceKm) / 20) * 100));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color = distanceKm <= 2 ? '#ba1a1a' : distanceKm <= 5 ? '#f59e0b' : '#0f5238';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-container" />
        <motion.circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <Truck className="w-6 h-6 relative z-10" style={{ color }} />
    </div>
  );
}

export function ProximityHUD({ proximity }: ProximityHUDProps) {
  const { homeLocation, distanceKm, etaMinutes, isWithinRadius, nearestTruck, isTagging, tagHomeLocation, clearHomeLocation } = proximity;
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [showAlert, setShowAlert] = useState(false);

  // Check notification permission state
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Show/hide the "Put your bins out!" alert when within radius
  useEffect(() => {
    setShowAlert(isWithinRadius);
  }, [isWithinRadius]);

  const handleRequestNotif = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  };

  // ── If no home tagged yet ──────────────────────────────────────────────────
  if (!homeLocation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface">Tag Your Location</p>
            <p className="text-xs text-on-surface/50 mt-1 leading-relaxed">
              Allow EcoCollect to know your home GPS position so we can track exactly when the truck will arrive and alert you.
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={tagHomeLocation}
          disabled={isTagging}
          className="mt-4 w-full h-12 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isTagging ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><MapPin className="w-4 h-4" /> Tag My Home Location</>
          )}
        </motion.button>
      </motion.div>
    );
  }

  // ── Location tagged — show live proximity card ─────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* ALERT BANNER — truck within 5km */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.6 } }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-start gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0"
            >
              <AlertTriangle className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-amber-800">🚛 Truck is nearby!</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                The waste truck is only <strong>{distanceKm?.toFixed(1)}km</strong> away. 
                <strong> Put your bins out now!</strong>
              </p>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-amber-500 hover:text-amber-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROXIMITY CARD */}
      <motion.div
        layout
        className={cn(
          'bg-white rounded-2xl p-5 shadow-sm border-2 transition-colors duration-500',
          isWithinRadius ? 'border-amber-300' : 'border-outline-variant/20'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface/40">Live Truck Tracking</p>
            <p className="text-sm font-bold text-on-surface mt-0.5">
              {nearestTruck?.vehicle_number ?? 'Truck'}
              <span className={cn(
                'ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                nearestTruck?.status === 'Collecting Waste' ? 'bg-[#cce6d0] text-[#0f5238]' : 'bg-blue-100 text-blue-700'
              )}>
                {nearestTruck?.status ?? 'Active'}
              </span>
            </p>
          </div>

          {/* Notification toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRequestNotif}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              notifPermission === 'granted' ? 'bg-[#cce6d0] text-[#0f5238]' : 'bg-surface-container text-on-surface/50'
            )}
            title={notifPermission === 'granted' ? 'Notifications on' : 'Enable notifications'}
          >
            {notifPermission === 'granted' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Distance + ETA row */}
        <div className="flex items-center gap-4">
          {/* Animated ring */}
          {distanceKm !== null && <DistanceRing distanceKm={distanceKm} />}

          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-surface-container rounded-xl p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface/40">Distance</p>
              <motion.p
                key={distanceKm?.toFixed(2)}
                initial={{ scale: 1.1, color: '#0f5238' }}
                animate={{ scale: 1, color: '#1b1b1d' }}
                transition={{ duration: 0.4 }}
                className="text-xl font-extrabold text-on-surface mt-0.5"
              >
                {distanceKm !== null ? `${distanceKm.toFixed(1)} km` : '—'}
              </motion.p>
            </div>

            <div className="bg-surface-container rounded-xl p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface/40">ETA</p>
              <motion.p
                key={etaMinutes}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-xl font-extrabold text-on-surface mt-0.5"
              >
                {etaMinutes !== null ? `${etaMinutes} min` : '—'}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Progress bar — distance shrinking toward 0 */}
        {distanceKm !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-on-surface/40 font-medium mb-1.5">
              <span>📍 Your home</span>
              <span>🚛 {distanceKm.toFixed(1)}km away</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  distanceKm <= 2 ? 'bg-red-500' : distanceKm <= 5 ? 'bg-amber-400' : 'bg-primary'
                )}
                animate={{ width: `${Math.max(2, Math.min(100, ((20 - distanceKm) / 20) * 100))}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-on-surface/30 mt-1">
              <span>20km</span>
              <span className="text-amber-500 font-bold">⚠ 5km alert zone</span>
              <span>0km</span>
            </div>
          </div>
        )}

        {/* Location info + reset */}
        <div className="mt-3 pt-3 border-t border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-on-surface/40">
            <MapPin className="w-3 h-3" />
            <span>{homeLocation.label ?? 'My Home'} · {homeLocation.lat.toFixed(3)}°, {homeLocation.lng.toFixed(3)}°</span>
          </div>
          <button
            onClick={clearHomeLocation}
            className="text-[10px] text-on-surface/30 hover:text-error transition-colors underline"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </div>
  );
}
