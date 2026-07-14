import { VehicleUpdate } from '@/types/tracking.types';

type VehicleUpdateCallback = (vehicles: VehicleUpdate[]) => void;

/**
 * TrackingService
 * 
 * A stub service layer to manage real-time vehicle updates.
 * Designed to be easily connected to Socket.IO or Supabase Realtime in the future.
 */
class TrackingService {
  private subscribers: Set<VehicleUpdateCallback> = new Set();
  
  // Future socket connection reference
  // private socket: Socket | null = null;

  constructor() {
    // Initialize socket connection here later
  }

  /**
   * Subscribe to real-time fleet updates.
   * @param callback Function to call when vehicles update.
   * @returns Unsubscribe function.
   */
  public subscribeToVehicleUpdates(callback: VehicleUpdateCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Broadcast an update locally (used by simulation).
   * In a real environment, this might listen to a WebSocket event instead.
   */
  public broadcastUpdate(vehicles: VehicleUpdate[]): void {
    this.subscribers.forEach(callback => callback(vehicles));
  }

  /**
   * Future method: Push a location update from a driver app to the backend.
   */
  public updateVehicleLocation(payload: Partial<VehicleUpdate>): void {
    // e.g. this.socket.emit('location_update', payload);
    console.log('[TrackingService] Emitting location update:', payload);
  }

  /**
   * Future method: Remove a vehicle from active tracking.
   */
  public removeVehicle(id: string): void {
    // e.g. this.socket.emit('vehicle_offline', { id });
    console.log('[TrackingService] Emitting vehicle offline:', id);
  }
}

// Export as a singleton
export const trackingService = new TrackingService();
