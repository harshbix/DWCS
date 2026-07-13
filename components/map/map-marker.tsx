'use client';

import { useEffect } from 'react';
import { useMapStore } from '@/stores/map.store';
import { MapMarker as MarkerInfo } from '@/lib/map/types';

interface MapMarkerProps extends Omit<MarkerInfo, 'updatedAt'> {}

/**
 * Declarative Virtual Map Marker
 * Registers itself inside useMapStore upon mount and cleans up on unmount.
 */
export function MapMarker({ id, type, position, title, description, iconUrl, metadata }: MapMarkerProps) {
  const { markers, setMarkers, updateMarkerPosition } = useMapStore();

  useEffect(() => {
    const existing = markers.find((m) => m.id === id);
    if (!existing) {
      const newMarker: MarkerInfo = {
        id,
        type,
        position,
        title,
        description,
        iconUrl,
        metadata,
        updatedAt: new Date().toISOString(),
      };
      setMarkers([...markers, newMarker]);
    } else if (
      existing.position.lat !== position.lat ||
      existing.position.lng !== position.lng
    ) {
      updateMarkerPosition(id, position);
    }
  }, [id, type, position.lat, position.lng, title, description, iconUrl]);

  // Clean up marker on unmount
  useEffect(() => {
    return () => {
      setMarkers(useMapStore.getState().markers.filter((m) => m.id !== id));
    };
  }, [id]);

  return null; // Declarative component with side effects, renders no DOM element
}
