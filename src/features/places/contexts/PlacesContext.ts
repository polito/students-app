import { createContext } from 'react';

export interface PlacesContextData {
  search: string;
  setSearch: (newSearch: string) => void;
}

export const PlacesContext = createContext<PlacesContextData>(
  {} as PlacesContextData,
);
