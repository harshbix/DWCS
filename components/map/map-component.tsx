'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from '@/stores/map.store';
import { useMap } from './map-provider';
import { Compass, Plus, Minus, MapPin, Truck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useVehicleSimulation } from '@/hooks/useVehicleSimulation';
import { useProximityTracking, type HomeLocation } from '@/hooks/useProximityTracking';
import { useInView } from 'framer-motion';

// Dynamically import MapboxMap with SSR disabled
const MapboxMap = dynamic(() => import('./mapbox-map'), {
  ssr: false,
});

interface MapComponentProps {
  className?: string;
  showControls?: boolean;
  homeLocation?: HomeLocation | null;
}

export function MapComponent({ className, showControls = true, homeLocation }: MapComponentProps) {
  const { zoom, center, setZoom } = useMapStore();
  const { recenterOnUser } = useMap();
  
  // Real-time tracking simulation
  const vehicles = useVehicleSimulation(homeLocation);

  // Lazy compile & render Mapbox only when visible
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "200px" });

  return (
    <div ref={containerRef} className={cn('relative w-full h-full bg-surface-container overflow-hidden select-none', className)}>
      {/* ── Real Mapbox GL JS ── */}
      {isInView ? (
        <MapboxMap vehicles={vehicles} homeLocation={homeLocation} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent shadow-sm" />
          <span className="text-xs text-on-surface/50 font-medium">Lazy loading mapping engine...</span>
        </div>
      )}

      {/* ── Map HUD Controls overlay ── */}
      {showControls && (
        <div className="absolute right-4 bottom-24 flex flex-col gap-2 z-[1000]">
          {/* Zoom controls */}
          <div className="flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest/90 backdrop-blur-md shadow-lg border border-outline/10">
            <button
              onClick={() => setZoom(Math.min(zoom + 1, 19))}
              className="h-10 w-10 flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer text-on-surface"
              aria-label="Zoom in"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="h-px bg-outline/10" />
            <button
              onClick={() => setZoom(Math.max(zoom - 1, 10))}
              className="h-10 w-10 flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer text-on-surface"
              aria-label="Zoom out"
            >
              <Minus className="h-5 w-5" />
            </button>
          </div>

          {/* Recenter on GPS */}
          <button
            onClick={recenterOnUser}
            className="h-10 w-10 rounded-xl flex items-center justify-center bg-surface-container-lowest/90 backdrop-blur-md hover:bg-surface-container transition-colors cursor-pointer shadow-lg border border-outline/10 text-primary"
            aria-label="Find my location"
          >
            <Compass className="h-5 w-5 animate-spin-slow" />
          </button>
        </div>
      )}

      {/* Coordinates Badge */}
      <div className="absolute left-4 bottom-24 px-3 py-1.5 rounded-xl bg-on-surface/85 backdrop-blur-sm text-[9px] font-mono text-surface pointer-events-none z-[1000] border border-outline/5 shadow-md">
        {center.lat.toFixed(4)}°, {center.lng.toFixed(4)}°
      </div>
    </div>
  );
}
