'use client';

import React from 'react';
import { MapComponent } from '@/components/map/map-component';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { User, Bell } from 'lucide-react';
import { useProximityTracking } from '@/hooks/useProximityTracking';

export function TrackingMapPage() {
  const proximity = useProximityTracking([]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Top Bar overlaid on map */}
      <header className="absolute top-0 inset-x-0 z-[1001] flex justify-between items-center px-5 py-4">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-3 py-2 shadow-sm border border-outline/10">
          <User className="w-4 h-4 text-on-surface/60" />
          <span className="text-sm font-semibold text-on-surface">Mbeya, TZ</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm border border-outline/10 text-on-surface-variant">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      {/* Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <MapComponent showControls={true} homeLocation={proximity.homeLocation} />
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 inset-x-0 z-[1001]">
        <MobileBottomNav role="citizen" />
      </div>
    </div>
  );
}
