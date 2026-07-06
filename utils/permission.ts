/**
 * Browser sensor and capability permission helpers.
 */

export interface PermissionStatusResult {
  state: 'granted' | 'denied' | 'prompt';
}

/**
 * Checks the status of a specific browser permission.
 */
export async function checkBrowserPermission(
  name: PermissionName
): Promise<PermissionStatusResult['state']> {
  if (typeof window === 'undefined' || !navigator.permissions) {
    return 'denied';
  }
  
  try {
    const status = await navigator.permissions.query({ name });
    return status.state;
  } catch (error) {
    console.warn(`Failed to query permission "${name}":`, error);
    return 'prompt';
  }
}

/**
 * Requests the current GPS coordinates of the device.
 */
export function getCurrentCoordinates(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}
