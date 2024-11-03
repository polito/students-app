import { RefObject, createContext } from 'react';

import { CameraRef, MapViewRef } from '@maplibre/maplibre-react-native';

interface MapNavigatorContextValue {
  mapRef: RefObject<MapViewRef>;
  cameraRef: RefObject<CameraRef>;
}

export const MapNavigatorContext = createContext<MapNavigatorContextValue>(
  {} as MapNavigatorContextValue,
);
