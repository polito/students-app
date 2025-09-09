import { createContext } from 'react';

interface PlacesContextValue {
  floorId?: string;
  setFloorId: (newFloorId?: string) => void;

  lines?: string[];
  setLines: (newLine: string) => void;

  selectedLine?: string;
  setSelectedLine: (newLine?: string) => void;
}

export const PlacesContext = createContext<PlacesContextValue>(
  {} as PlacesContextValue,
);
