import { RefObject, createContext } from 'react';

import { Camera, MapView } from '@rnmapbox/maps';

interface MapNavigatorContextValue {
  mapRef: RefObject<MapView>;
  cameraRef: RefObject<Camera>;
}

export const MapNavigatorContext = createContext<MapNavigatorContextValue>(
  {} as MapNavigatorContextValue,
);
