'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useMapStore } from '@/stores/map.store';
import { LocationService } from '@/lib/map/location-service';
import { Coordinate } from '@/lib/map/types';

interface MapContextProps {
  requestLocationPermission: () => Promise<boolean>;
  recenterOnUser: () => Promise<void>;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapStore = useMapStore();
  const watchIdRef = useRef<number | null>(null);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const status = await LocationService.checkPermission();
      mapStore.setPermission(status);

      if (status === 'granted') return true;
      if (status === 'denied') return false;

      // Prompt user by calling getCurrentPosition once
      const coords = await LocationService.getCurrentPosition();
      mapStore.setUserLocation(coords);
      mapStore.setPermission('granted');
      return true;
    } catch {
      mapStore.setPermission('denied');
      return false;
    }
  };

  const recenterOnUser = async () => {
    if (mapStore.userLocation) {
      mapStore.setCenter(mapStore.userLocation);
      return;
    }

    const granted = await requestLocationPermission();
    if (granted) {
      try {
        const coords = await LocationService.getCurrentPosition();
        mapStore.setUserLocation(coords);
        mapStore.setCenter(coords);
      } catch {
        // Fallback or ignore
      }
    }
  };

  // Watch position if tracking is enabled
  useEffect(() => {
    if (mapStore.isTracking) {
      requestLocationPermission().then((granted) => {
        if (!granted) {
          mapStore.setIsTracking(false);
          return;
        }

        const id = LocationService.watchPosition(
          (coords) => {
            mapStore.setUserLocation(coords);
          },
          (error) => {
            console.error('Location tracking error:', error);
            mapStore.setIsTracking(false);
          }
        );
        watchIdRef.current = id;
      });
    } else {
      if (watchIdRef.current !== null) {
        LocationService.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        LocationService.clearWatch(watchIdRef.current);
      }
    };
  }, [mapStore.isTracking]);

  return (
    <MapContext.Provider value={{ requestLocationPermission, recenterOnUser }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
