import { Coordinate, PermissionStatus } from './types';

/**
 * Service to manage browser geolocation, permission states, and active tracking.
 */
export class LocationService {
  /**
   * Check browser permission status for Geolocation API
   */
  static async checkPermission(): Promise<PermissionStatus> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return 'unsupported';
    }

    try {
      // Permission API is not fully unified in all browsers (e.g. Safari), handle gracefully
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        return status.state as PermissionStatus;
      }
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  /**
   * Get current one-off coordinates
   */
  static getCurrentPosition(): Promise<Coordinate> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Start tracking user position continuously
   */
  static watchPosition(
    onSuccess: (coords: Coordinate) => void,
    onError: (error: GeolocationPositionError) => void
  ): number | null {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
        });
      },
      onError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Stop tracking position
   */
  static clearWatch(watchId: number): void {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}
