import { Palette } from '@lib/ui/types/Theme';
import { PlaceOverview } from '@polito/api-client';

import { AgendaItem } from '../agenda/types/AgendaItem';

export interface CategoryData {
  icon: string;
  color: string;
  shade?: keyof Palette;
  priority: number;
  children: Record<string, Partial<CategoryData>>;
}

export type PlaceOverviewWithMetadata = PlaceOverview & {
  agendaItem?: AgendaItem;
};
