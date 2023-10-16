import { Palette } from '@lib/ui/types/Theme';
import { Building, PlaceOverview } from '@polito/api-client';

import { AgendaItem } from '../agenda/types/AgendaItem';

export interface CategoryData {
  icon: string;
  color: string;
  shade?: keyof Palette;
  priority: number;
  showInitially?: boolean;
  children: Record<string, Partial<CategoryData>>;
}

export type PlaceOverviewWithMetadata = PlaceOverview & {
  type: 'place';
  agendaItem?: AgendaItem;
};

export type BuildingWithMetadata = Building & {
  type: 'building';
};

export type SearchPlace = PlaceOverviewWithMetadata | BuildingWithMetadata;

export const isPlace = (
  placeOrBuilding: SearchPlace,
): placeOrBuilding is PlaceOverviewWithMetadata =>
  placeOrBuilding.type === 'place';
