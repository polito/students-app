import { createContext } from 'react';

import { PlaceOverview } from '@polito/api-client';

interface PlacesContextValue {
  floorId?: string;
  setFloorId: (newFloorId?: string) => void;

  lines?: string[];
  setLines: (newLine: string) => void;

  selectedLine?: string;
  setSelectedLine: (newLine?: string) => void;

  itineraryMode?: boolean;
  setItineraryMode: (mode: boolean) => void;

  selectionMode?: boolean;
  setSelectionMode: (mode: boolean) => void;

  handleSelectSegment: (label: string, floor: string) => void;

  selectedPlace: PlaceOverview | null;
  setSelectedPlace: (place: PlaceOverview | null) => void;

  selectionIcon: string | null;
  setSelectionIcon: (icon: string) => void;
}

export const PlacesContext = createContext<PlacesContextValue>(
  {} as PlacesContextValue,
);
