import { create } from 'zustand';
import { Coordinate, MapMarker, MapRoute, PermissionStatus } from '@/lib/map/types';

interface MapState {
  center: Coordinate;
  zoom: number;
  markers: MapMarker[];
  routes: MapRoute[];
  activeRouteId: string | null;
  userLocation: Coordinate | null;
  permission: PermissionStatus;
  isTracking: boolean;

  setCenter: (center: Coordinate) => void;
  setZoom: (zoom: number) => void;
  setMarkers: (markers: MapMarker[]) => void;
  updateMarkerPosition: (id: string, position: Coordinate) => void;
  setRoutes: (routes: MapRoute[]) => void;
  setActiveRouteId: (id: string | null) => void;
  setUserLocation: (location: Coordinate | null) => void;
  setPermission: (permission: PermissionStatus) => void;
  setIsTracking: (isTracking: boolean) => void;
  clearState: () => void;
}

const DEFAULT_CENTER: Coordinate = { lat: -8.941, lng: 33.4056 }; // Iyunga, Mbeya

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: 14,
  markers: [],
  routes: [],
  activeRouteId: null,
  userLocation: null,
  permission: 'prompt',
  isTracking: false,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setMarkers: (markers) => set({ markers }),
  updateMarkerPosition: (id, position) =>
    set((state) => ({
      markers: state.markers.map((m) =>
        m.id === id ? { ...m, position, updatedAt: new Date().toISOString() } : m
      ),
    })),
  setRoutes: (routes) => set({ routes }),
  setActiveRouteId: (activeRouteId) => set({ activeRouteId }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setPermission: (permission) => set({ permission }),
  setIsTracking: (isTracking) => set({ isTracking }),
  clearState: () =>
    set({
      center: DEFAULT_CENTER,
      zoom: 13,
      markers: [],
      routes: [],
      activeRouteId: null,
      userLocation: null,
      isTracking: false,
    }),
}));
