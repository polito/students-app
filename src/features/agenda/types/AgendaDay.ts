import { DateTime } from 'luxon';

import { AgendaItem } from './AgendaItem';

export interface AgendaDay {
  key: string;
  date: DateTime;
  isToday: boolean;
  items: AgendaItem[];
}
