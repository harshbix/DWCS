'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMapStore } from '@/stores/map.store';
import L from 'leaflet';

// Compute heading angle between two coordinates
function getHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const lat2Cos = Math.cos(lat2Rad);
  const y = Math.sin(dLon) * lat2Cos;
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * lat2Cos * Math.cos(dLon);
  const brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}

// OSRM Routing Client
async function fetchOSRMRoute(waypoints: { lat: number; lng: number }[]): Promise<[number, number][]> {
  if (waypoints.length < 2) return [];
  try {
    const coordsString = waypoints.map((w) => `${w.lng},${w.lat}`).join(';');
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const routeCoords = data.routes[0].geometry.coordinates;
      return routeCoords.map((c: any) => [c[1], c[0]] as [number, number]);
    }
  } catch (err) {
    console.error('OSRM route fetch failed, using straight line:', err);
  }
  return waypoints.map((w) => [w.lat, w.lng] as [number, number]);
}

export default function LeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const prevCoordsRef = useRef<{ [key: string]: L.LatLng }>({});
  const animationFrameRefs = useRef<{ [key: string]: number }>({});
  const [isManualMode, setIsManualMode] = useState(false);

  const { center, zoom, markers, routes, userLocation } = useMapStore();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Premium voyager tiles styling (Apple Maps look & feel)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Detect user manual interaction to disable auto centering yanking
    map.on('dragstart zoomstart touchstart', () => {
      setIsManualMode(true);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // Clean up animations
      Object.values(animationFrameRefs.current).forEach(cancelAnimationFrame);
    };
  }, []);

  // Recenter map center from store (only if user is not manually navigating)
  useEffect(() => {
    if (!mapRef.current || isManualMode) return;
    mapRef.current.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center.lat, center.lng, zoom, isManualMode]);

  // Fit camera bounds when both user and vehicle location are present
  useEffect(() => {
    if (!mapRef.current || isManualMode) return;

    const activeTruck = markers.find((m) => m.type === 'truck');
    if (userLocation && activeTruck) {
      mapRef.current.fitBounds(
        [
          [userLocation.lat, userLocation.lng],
          [activeTruck.position.lat, activeTruck.position.lng],
        ],
        { padding: [60, 60], maxZoom: 16, animate: true }
      );
    }
  }, [userLocation, markers, isManualMode]);

  // Interpolated smooth vehicle movement loop
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkerIds = new Set(markers.map((m) => m.id));

    // Remove obsolete markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentMarkerIds.has(id) && id !== 'user-gps-location') {
        markersRef.current[id].remove();
        delete markersRef.current[id];
        delete prevCoordsRef.current[id];
      }
    });

    // Render / animate markers
    markers.forEach((marker) => {
      const color = marker.type === 'truck' ? 'var(--color-primary)' : marker.type === 'bin' ? '#2d6a4f' : '#ba1a1a';
      const isTruck = marker.type === 'truck';

      const customHtml = `
        <div class="relative flex items-center justify-center">
          ${isTruck ? '<div class="absolute h-10 w-10 bg-primary/20 rounded-full animate-ping opacity-60"></div>' : ''}
          <div class="truck-rotate-wrapper flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-base shadow-lg transition-transform duration-300"
               style="border-color: ${color};">
            ${isTruck ? '🚛' : '📍'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const startPos = prevCoordsRef.current[marker.id] || L.latLng(marker.position.lat, marker.position.lng);
      const endPos = L.latLng(marker.position.lat, marker.position.lng);

      if (markersRef.current[marker.id]) {
        const leafMarker = markersRef.current[marker.id];
        leafMarker.setIcon(customIcon);

        // Calculate vehicle heading
        if (isTruck && (startPos.lat !== endPos.lat || startPos.lng !== endPos.lng)) {
          const heading = getHeading(startPos.lat, startPos.lng, endPos.lat, endPos.lng);
          const element = leafMarker.getElement();
          if (element) {
            const rotateWrapper = element.querySelector('.truck-rotate-wrapper') as HTMLElement;
            if (rotateWrapper) {
              rotateWrapper.style.transform = `rotate(${heading}deg)`;
            }
          }
        }

        // Interpolation animation over 3000ms
        if (animationFrameRefs.current[marker.id]) {
          cancelAnimationFrame(animationFrameRefs.current[marker.id]);
        }

        const duration = 2800;
        const startTime = performance.now();

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Quadratic easing out for premium feel
          const easedProgress = progress * (2 - progress);

          const currentLat = startPos.lat + (endPos.lat - startPos.lat) * easedProgress;
          const currentLng = startPos.lng + (endPos.lng - startPos.lng) * easedProgress;

          leafMarker.setLatLng([currentLat, currentLng]);

          if (progress < 1) {
            animationFrameRefs.current[marker.id] = requestAnimationFrame(animate);
          } else {
            prevCoordsRef.current[marker.id] = endPos;
          }
        };

        animationFrameRefs.current[marker.id] = requestAnimationFrame(animate);

      } else {
        // Create new marker
        const leafMarker = L.marker(endPos, { icon: customIcon }).addTo(map);
        markersRef.current[marker.id] = leafMarker;
        prevCoordsRef.current[marker.id] = endPos;
      }
    });

  }, [markers]);

  // Sync User Location Marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const id = 'user-gps-location';
    const map = mapRef.current;

    const userHtml = `
      <div class="relative flex h-5 w-5 items-center justify-center">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-40"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-tertiary border-2 border-white shadow-lg"></span>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (markersRef.current[id]) {
      markersRef.current[id].setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const leafMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      markersRef.current[id] = leafMarker;
    }
  }, [userLocation]);

  // Snapped OSRM Road-aware routes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const drawSnappedRoute = async () => {
      const activeTruck = markers.find((m) => m.type === 'truck');
      if (userLocation && activeTruck) {
        // Fetch road-snapped route from OSRM
        const snappedPoints = await fetchOSRMRoute([
          { lat: activeTruck.position.lat, lng: activeTruck.position.lng },
          { lat: userLocation.lat, lng: userLocation.lng },
        ]);

        if (snappedPoints.length > 0) {
          const polyline = L.polyline(snappedPoints, {
            color: 'var(--color-primary)',
            weight: 5,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          polylineRef.current = polyline;
        }
      } else if (routes.length > 0) {
        // Fallback to route stops
        const snappedPoints = await fetchOSRMRoute(routes[0].waypoints.map(w => w.position));
        const polyline = L.polyline(snappedPoints, {
          color: '#2d6a4f',
          weight: 4,
          opacity: 0.7,
          dashArray: '4, 8',
        }).addTo(map);
        polylineRef.current = polyline;
      }
    };

    drawSnappedRoute();
  }, [routes, userLocation, markers]);

  // Floating compass reset manual override button
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
