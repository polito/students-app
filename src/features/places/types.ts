import { Building, PlaceOverview } from '@polito/api-client';

export type SearchPlace = PlaceOverview | Building;

export const isPlace = (
  placeOrBuilding: SearchPlace,
): placeOrBuilding is PlaceOverview => 'room' in placeOrBuilding;
