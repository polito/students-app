import { Interval } from 'luxon';

import { AgendaDay } from './AgendaDay';

export interface AgendaWeek {
  key: string;
  dateRange: Interval;
  data: AgendaDay[];
}
