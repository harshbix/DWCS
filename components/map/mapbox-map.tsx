'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '@/stores/map.store';
import { VehicleUpdate } from '@/types/tracking.types';
import type { HomeLocation } from '@/hooks/useProximityTracking';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapboxMapProps {
  vehicles?: VehicleUpdate[];
  homeLocation?: HomeLocation | null;
}

// Helper to format relative time
function getRelativeTime(isoString: string): string {
  const diff = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff} seconds ago`;
  const mins = Math.floor(diff / 60);
  return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
}

export default function MapboxMap({ vehicles = [], homeLocation }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const homeMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  const { center, zoom } = useMapStore();
  const [isManualMode, setIsManualMode] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is missing from environment variables.');
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Clean, premium look
      center: [center.lng, center.lat],
      zoom: zoom,
      pitch: 45, // Slight 3D pitch for modern navigation feel
      bearing: 0,
      attributionControl: false,
    });

    map.on('dragstart', () => setIsManualMode(true));
    map.on('zoomstart', () => setIsManualMode(true));

    mapRef.current = map;

    return () => {
      // Clean up map instance on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync center & zoom when store changes (if not dragging)
  useEffect(() => {
    if (!mapRef.current || isManualMode) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: zoom,
      essential: true,
    });
  }, [center.lat, center.lng, zoom, isManualMode]);

  // Manage Vehicle Tracking Markers & Viewport Culling
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const renderVisibleMarkers = () => {
      const bounds = map.getBounds();

      vehicles.forEach((truck) => {
        // CULLING LOGIC: Only compile/render if the truck is within the visible map boundaries
        const isVisible = bounds.contains([truck.longitude, truck.latitude]);
        let marker = markersRef.current[truck.id];

        if (!isVisible) {
          // If truck goes off-screen, remove it from the DOM to save CPU/Memory
          if (marker) {
            marker.remove();
            delete markersRef.current[truck.id];
          }
          return;
        }

        // If visible, process the marker
        const relativeTime = getRelativeTime(truck.last_updated);
        const popupHtml = `
          <div class="p-3 font-sans min-w-[200px]">
            <h3 class="font-bold text-sm text-gray-900 border-b pb-1 mb-2">Vehicle: <span class="text-primary">${truck.id}</span></h3>
            <p class="text-xs text-gray-700 mb-1"><span class="font-semibold w-16 inline-block">Location:</span> ${truck.location_label}</p>
            <p class="text-xs text-gray-700 mb-1"><span class="font-semibold w-16 inline-block">Status:</span> <span class="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium">${truck.status}</span></p>
            <p class="text-xs text-gray-700 mb-2"><span class="font-semibold w-16 inline-block">Speed:</span> ${truck.speed} km/h</p>
            <div class="text-[10px] text-gray-400 border-t pt-1 mt-1 text-right italic">Last Update: ${relativeTime}</div>
          </div>
        `;

        if (!marker) {
          // Create custom DOM element for the truck marker
          const el = document.createElement('div');
          el.className = 'custom-truck-marker';
          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              <div class="absolute h-10 w-10 bg-primary/20 rounded-full animate-ping opacity-60"></div>
              <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-base shadow-lg"
                   style="border-color: var(--color-primary);">
                🚛
              </div>
            </div>
          `;

          // Create Popup
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);

          // Create and add Marker
          marker = new mapboxgl.Marker({ element: el })
            .setLngLat([truck.longitude, truck.latitude])
            .setPopup(popup)
            .addTo(map);

          markersRef.current[truck.id] = marker;
        } else {
          // Update existing marker position
          marker.setLngLat([truck.longitude, truck.latitude]);
          const popup = marker.getPopup();
          if (popup) {
            popup.setHTML(popupHtml);
          }
        }
      });

      // Cleanup obsolete markers (if a truck is removed from the array)
      const currentIds = new Set(vehicles.map(t => t.id));
      Object.keys(markersRef.current).forEach(id => {
        if (!currentIds.has(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });
    };

    // Render initially
    renderVisibleMarkers();

    // Re-calculate culling when the user pans/zooms the map
    map.on('move', renderVisibleMarkers);

    return () => {
      map.off('move', renderVisibleMarkers);
    };
  }, [vehicles]);

  // Home Location Pin
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!homeLocation) {
      if (homeMarkerRef.current) {
        homeMarkerRef.current.remove();
        homeMarkerRef.current = null;
      }
      return;
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <div style="
        width: 36px; height: 36px;
        background: white;
        border: 3px solid #0f5238;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        cursor: pointer;
      ">🏠</div>
    `;

    const popup = new mapboxgl.Popup({ offset: 20, closeButton: false })
      .setHTML(`<div style="padding:8px; font-family:sans-serif;">
        <strong style="font-size:12px;">My Home</strong><br/>
        <span style="font-size:11px; color:#666;">${homeLocation.lat.toFixed(4)}°N, ${homeLocation.lng.toFixed(4)}°E</span>
      </div>`);

    if (homeMarkerRef.current) {
      homeMarkerRef.current.setLngLat([homeLocation.lng, homeLocation.lat]);
    } else {
      homeMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([homeLocation.lng, homeLocation.lat])
        .setPopup(popup)
        .addTo(map);

      // Fly to home location
      map.flyTo({ center: [homeLocation.lng, homeLocation.lat], zoom: 14, duration: 1500, essential: true });
    }
  }, [homeLocation]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
      
      {isManualMode && (
        <button
          onClick={() => setIsManualMode(false)}
          className="absolute left-4 top-20 z-[1000] px-3.5 py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 shadow-lg border border-white/10 hover:scale-105 active:scale-95 transition-all animate-fade-slide-up"
        >
          🧭 Auto-Center Tracker
        </button>
      )}
    </div>
  );
}
