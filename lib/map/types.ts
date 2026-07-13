/**
 * EcoCollect Tanzania — Map Abstraction Types
 * Defines data structures for coordinates, map markers, route points, and status.
 */

export interface Coordinate {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export type MarkerType = 'truck' | 'bin' | 'complaint' | 'facility' | 'driver' | 'user';

export interface MapMarker {
  id: string;
  type: MarkerType;
  position: Coordinate;
  title: string;
  description?: string;
  iconUrl?: string;
  metadata?: Record<string, any>;
  updatedAt: string;
}

export interface RouteWaypoint {
  id: string;
  position: Coordinate;
  name: string;
  stopSequence: number;
  status: 'pending' | 'completed' | 'skipped';
  estimatedArrival?: string;
  actualArrival?: string | null;
}

export interface MapRoute {
  id: string;
  name: string;
  color?: string;
  waypoints: RouteWaypoint[];
  geometryPoints?: Coordinate[]; // Polyline coordinates for routing
}

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';
