'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from '@/stores/map.store';
import { useMap } from './map-provider';
import { Compass, Plus, Minus, MapPin, Truck } from 'lucide-react';
import { cn } from '@/utils/cn';

// Dynamically import LeafletMap with SSR disabled to avoid Node environment window crash
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container gap-2">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-xs text-on-surface/50 font-medium">Loading Map Tracker...</span>
    </div>
  ),
});

interface MapComponentProps {
  className?: string;
  showControls?: boolean;
}

export function MapComponent({ className, showControls = true }: MapComponentProps) {
  const { zoom, center, setZoom } = useMapStore();
  const { recenterOnUser } = useMap();

  return (
    <div className={cn('relative w-full h-full bg-surface-container overflow-hidden select-none', className)}>
      {/* ── Real Leaflet Vector Map ── */}
      <LeafletMap />

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
