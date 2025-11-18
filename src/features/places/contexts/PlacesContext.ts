import { createContext } from 'react';

import { PlaceOverview } from '@polito/api-client';

interface PlacesContextValue {
  floorId?: string;
  setFloorId: (newFloorId?: string) => void;

  selectedSegmentId?: number;
  setSelectedSegmentId: (newSegmentId?: number) => void;

  itineraryMode?: boolean;
  setItineraryMode: (mode: boolean) => void;

  selectionMode?: boolean;
  setSelectionMode: (mode: boolean) => void;

  handleSelectSegment: (label: number, floor: string) => void;

  selectedPlace: PlaceOverview | null;
  setSelectedPlace: (place: PlaceOverview | null) => void;

  selectionIcon: string | null;
  setSelectionIcon: (icon: string) => void;
}

export const PlacesContext = createContext<PlacesContextValue>(
  {} as PlacesContextValue,
);
