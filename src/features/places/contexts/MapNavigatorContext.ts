import { RefObject, createContext } from 'react';

import { Camera, MapView } from '@rnmapbox/maps';

interface MapNavigatorContextValue {
  mapRef: RefObject<MapView | null>;
  cameraRef: RefObject<Camera | null>;
  selectedId: string;
  setSelectedId: (id: string) => void;
}

export const MapNavigatorContext = createContext<MapNavigatorContextValue>(
  {} as MapNavigatorContextValue,
);
