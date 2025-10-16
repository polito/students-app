import { DateTime } from 'luxon';

import { SingleEvent } from '../../courses/types/Recurrence';

export const cleanupPastSingleEvents = (
  singleEvents: SingleEvent[] | undefined,
): SingleEvent[] => {
  if (!singleEvents || singleEvents.length === 0) {
    return [];
  }

  const today = DateTime.now().minus({ week: 4 }).startOf('day');

  return singleEvents.filter(event => {
    const eventDate = DateTime.fromISO(event.day);
    return eventDate >= today;
  });
};
