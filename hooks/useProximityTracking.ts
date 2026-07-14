import { useState, useEffect, useCallback, useRef } from 'react';
import { VehicleUpdate } from '@/types/tracking.types';
import { toast } from '@/utils/toast';

const HOME_LOCATION_KEY = 'eco_home_location';
const PROXIMITY_THRESHOLD_KM = 5;
const ALERT_COOLDOWN_MS = 10 * 60 * 1000; // 10 mins between alerts

export interface HomeLocation {
  lat: number;
  lng: number;
  savedAt: string;
  label?: string;
}

export interface ProximityState {
  homeLocation: HomeLocation | null;
  distanceKm: number | null;
  etaMinutes: number | null;
  isWithinRadius: boolean;
  nearestTruck: VehicleUpdate | null;
  isTagging: boolean;
  tagHomeLocation: () => void;
  clearHomeLocation: () => void;
}

/**
 * Haversine formula — great-circle distance between two GPS points (km).
 */
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Request browser push notification permission.
 * Returns 'granted', 'denied', or 'default'.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

/**
 * Fire a browser push notification with a fallback to in-app toast.
 */
function fireProximityAlert(distanceKm: number, truckId: string) {
  const title = '🚛 Waste Truck Nearby!';
  const body = `Truck ${truckId} is ${distanceKm.toFixed(1)}km from your location. Please put your bins out now!`;

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        tag: 'truck-proximity', // dedupe: replaces any existing proximity notification
        requireInteraction: true,
      });
      return;
    } catch {
      // Notification API unavailable (e.g. iframe sandbox) — fall through to toast
    }
  }

  // In-app fallback
  toast.warn(title, body);
}

/**
 * useProximityTracking
 *
 * Core hook that:
 * 1. Loads/saves the citizen's tagged home GPS location from localStorage.
 * 2. Accepts the live vehicle list and finds the closest truck assigned to this citizen.
 * 3. Computes real-time distance (km) and ETA (minutes) to the citizen's home.
 * 4. Fires a single browser push notification when a truck enters 5km radius.
 */
export function useProximityTracking(
  vehicles: VehicleUpdate[],
  assignedVehicleId?: string | null
): ProximityState {
  const [homeLocation, setHomeLocation] = useState<HomeLocation | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(HOME_LOCATION_KEY);
      return raw ? (JSON.parse(raw) as HomeLocation) : null;
    } catch {
      return null;
    }
  });

  const [isTagging, setIsTagging] = useState(false);
  const lastAlertRef = useRef<number>(0);
  const hasAlertedRef = useRef<boolean>(false);

  // Save location to localStorage whenever it changes
  useEffect(() => {
    if (homeLocation) {
      localStorage.setItem(HOME_LOCATION_KEY, JSON.stringify(homeLocation));
    } else {
      localStorage.removeItem(HOME_LOCATION_KEY);
    }
  }, [homeLocation]);

  // Tag the citizen's current GPS position as home
  const tagHomeLocation = useCallback(() => {
    setIsTagging(true);
    if (!navigator.geolocation) {
      toast.error('GPS Unavailable', 'Your browser does not support geolocation.');
      setIsTagging(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc: HomeLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          savedAt: new Date().toISOString(),
          label: 'My Home',
        };
        setHomeLocation(loc);
        hasAlertedRef.current = false; // reset alert state for new location
        setIsTagging(false);

        // Request notification permission at the same time
        await requestNotificationPermission();

        toast.success(
          '📍 Location Tagged!',
          `Your home is set at ${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E. You'll be notified when a truck is within 5km.`
        );
      },
      (err) => {
        setIsTagging(false);
        // Fallback: use Mbeya city center
        const fallback: HomeLocation = {
          lat: -8.9000,
          lng: 33.4500,
          savedAt: new Date().toISOString(),
          label: 'Mbeya (approx.)',
        };
        setHomeLocation(fallback);
        toast.info('GPS Fallback', 'Using approximate Mbeya coordinates. Please allow GPS for accuracy.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const clearHomeLocation = useCallback(() => {
    setHomeLocation(null);
    hasAlertedRef.current = false;
    toast.info('Location Cleared', 'Your home location has been removed.');
  }, []);

  // Find nearest/assigned truck and compute proximity
  const nearestTruck = (() => {
    if (!vehicles.length) return null;
    // Prefer the vehicle assigned to this citizen's schedule
    if (assignedVehicleId) {
      const assigned = vehicles.find(v => v.id === assignedVehicleId || v.vehicle_number === assignedVehicleId);
      if (assigned) return assigned;
    }
    // Otherwise pick the closest truck by GPS
    if (!homeLocation) return vehicles[0];
    return vehicles.reduce((closest, v) => {
      const dCurrent = haversineKm(homeLocation.lat, homeLocation.lng, v.latitude, v.longitude);
      const dClosest = haversineKm(homeLocation.lat, homeLocation.lng, closest.latitude, closest.longitude);
      return dCurrent < dClosest ? v : closest;
    });
  })();

  // Real-time distance + ETA
  const distanceKm = nearestTruck && homeLocation
    ? haversineKm(homeLocation.lat, homeLocation.lng, nearestTruck.latitude, nearestTruck.longitude)
    : null;

  const etaMinutes = distanceKm !== null && nearestTruck && nearestTruck.speed > 0
    ? Math.round((distanceKm / nearestTruck.speed) * 60)
    : null;

  const isWithinRadius = distanceKm !== null && distanceKm <= PROXIMITY_THRESHOLD_KM;

  // Proximity alert trigger
  useEffect(() => {
    if (!isWithinRadius || !nearestTruck || !homeLocation) return;
    if (hasAlertedRef.current) return;

    const now = Date.now();
    if (now - lastAlertRef.current < ALERT_COOLDOWN_MS) return;

    hasAlertedRef.current = true;
    lastAlertRef.current = now;
    fireProximityAlert(distanceKm!, nearestTruck.vehicle_number);
  }, [isWithinRadius, nearestTruck, homeLocation, distanceKm]);

  // Reset alert when truck moves away (> 6km)
  useEffect(() => {
    if (distanceKm !== null && distanceKm > 6) {
      hasAlertedRef.current = false;
    }
  }, [distanceKm]);

  return {
    homeLocation,
    distanceKm,
    etaMinutes,
    isWithinRadius,
    nearestTruck,
    isTagging,
    tagHomeLocation,
    clearHomeLocation,
  };
}
