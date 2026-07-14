import { useState, useEffect, useCallback } from 'react';
import { VehicleUpdate } from '@/types/tracking.types';
import { trackingService } from '@/services/tracking.service';
import { HomeLocation } from './useProximityTracking';

const MBEYA_CENTER = { lat: -8.9000, lng: 33.4500 };

// Truck starts ~8km away from Mbeya centre
const INITIAL_VEHICLES: VehicleUpdate[] = [
  {
    id: 'TRUCK-001',
    vehicle_number: 'T 123 ABC',
    latitude: -8.870, // ~3.5km north of center
    longitude: 33.450,
    speed: 35,
    status: 'Collecting Waste',
    location_label: 'Iyunga, Mbeya',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'TRUCK-002',
    vehicle_number: 'T 456 DEF',
    latitude: -8.940,
    longitude: 33.510,
    speed: 42,
    status: 'In Transit',
    location_label: 'Mbeya Urban',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'TRUCK-003',
    vehicle_number: 'T 789 GHI',
    latitude: -8.960,
    longitude: 33.390,
    speed: 15,
    status: 'Collecting Waste',
    location_label: 'Mbeya City',
    last_updated: new Date().toISOString(),
  }
];

/**
 * Move a truck one step toward a target location.
 * Speed is in km/h, tick interval is in seconds.
 */
function stepToward(
  current: { lat: number; lng: number },
  target: { lat: number; lng: number },
  speedKmh: number,
  tickSeconds: number,
  noiseFactor = 0.0001
): { lat: number; lng: number } {
  const distLat = target.lat - current.lat;
  const distLng = target.lng - current.lng;
  const dist = Math.sqrt(distLat * distLat + distLng * distLng);
  if (dist < 0.0001) return current; // Already at target

  // Each degree of lat ≈ 111km, each degree of lng ≈ 111 * cos(lat) km
  const movePerTick = (speedKmh / 3600) * tickSeconds / 111;
  const ratio = Math.min(1, movePerTick / dist);

  return {
    lat: current.lat + distLat * ratio + (Math.random() - 0.5) * noiseFactor,
    lng: current.lng + distLng * ratio + (Math.random() - 0.5) * noiseFactor,
  };
}

/**
 * useVehicleSimulation
 *
 * Simulates truck GPS movement. When a citizen home location is provided,
 * TRUCK-001 (the assigned truck) moves progressively toward the home,
 * making the proximity tracker show a decreasing distance and ETA.
 */
export function useVehicleSimulation(homeLocation?: HomeLocation | null) {
  const [vehicles, setVehicles] = useState<VehicleUpdate[]>(INITIAL_VEHICLES);

  const target = homeLocation
    ? { lat: homeLocation.lat, lng: homeLocation.lng }
    : MBEYA_CENTER;

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) => {
        const next = prev.map((v) => {
          // TRUCK-001: move toward citizen's home or city center
          if (v.id === 'TRUCK-001') {
            const newPos = stepToward(
              { lat: v.latitude, lng: v.longitude },
              target,
              v.speed,
              5, // 5-second tick
              0.00005
            );
            const newSpeed = Math.max(15, Math.min(55, v.speed + (Math.random() - 0.4) * 5));
            let newStatus = v.status;
            if (Math.random() > 0.92) {
              newStatus = newStatus === 'Collecting Waste' ? 'In Transit' : 'Collecting Waste';
            }
            return {
              ...v,
              latitude: newPos.lat,
              longitude: newPos.lng,
              speed: Math.round(newSpeed),
              status: newStatus,
              last_updated: new Date().toISOString(),
            };
          }

          // TRUCK-002 / 003: random drift (off route)
          const latNoise = (Math.random() - 0.5) * 0.0003;
          const lngNoise = (Math.random() - 0.5) * 0.0003;
          const newSpeed = Math.max(0, Math.min(60, v.speed + (Math.random() - 0.5) * 8));
          return {
            ...v,
            latitude: v.latitude + latNoise,
            longitude: v.longitude + lngNoise,
            speed: Math.round(newSpeed),
            last_updated: new Date().toISOString(),
          };
        });

        trackingService.broadcastUpdate(next);
        return next;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [target.lat, target.lng]);

  return vehicles;
}
