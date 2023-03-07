import { DateTime } from 'luxon';

import { AgendaDay } from './AgendaDay';

export interface AgendaWeek {
  since: DateTime;
  until: DateTime;
  data: AgendaDay[];
}
