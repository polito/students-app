import { createContext } from 'react';

interface PlacesContextValue {
  floorId?: string;
  setFloorId: (newFloorId?: string) => void;
}

export const PlacesContext = createContext<PlacesContextValue>(
  {} as PlacesContextValue,
);
