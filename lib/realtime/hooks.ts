import { useEffect, useState } from 'react';
import { getRealtimeChannel } from './client';
import { RealtimeConnectionManager, ConnectionState } from './connection';

export interface LocationTelemetry {
  plateNumber: string;
  latitude: number;
  longitude: number;
  speed: string;
  timestamp: string;
}

/**
 * Custom hook to subscribe to vehicle location updates in real-time.
 */
export function useVehicleTelemetry(plateNumber: string) {
  const [telemetry, setTelemetry] = useState<LocationTelemetry | null>(null);
  const [connection, setConnection] = useState<ConnectionState>({ status: 'disconnected' });

  useEffect(() => {
    const channel = getRealtimeChannel(`telemetry:${plateNumber}`);
    if (!channel) return;

    const manager = new RealtimeConnectionManager(channel);
    
    // Track connection state changes
    const unsubStatus = manager.onStatusChange((state) => {
      setConnection(state);
    });

    // Subscribe to telemetry broadcast events
    channel.on('broadcast', { event: 'location_update' }, (response) => {
      if (response.payload) {
        setTelemetry(response.payload as LocationTelemetry);
      }
    });

    manager.connect();

    return () => {
      unsubStatus();
      manager.disconnect();
    };
  }, [plateNumber]);

  return { telemetry, connection };
}

/**
 * Custom hook to listen to system-wide real-time notification alerts.
 */
export function useLiveSystemAlerts() {
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    const channel = getRealtimeChannel('system:alerts');
    if (!channel) return;

    const manager = new RealtimeConnectionManager(channel);

    channel.on('broadcast', { event: 'alert' }, (response) => {
      if (response.payload && typeof response.payload === 'object') {
        const payload = response.payload as { message: string };
        setAlert(payload.message || 'System alert received');
      }
    });

    manager.connect();

    return () => {
      manager.disconnect();
    };
  }, []);

  return alert;
}
