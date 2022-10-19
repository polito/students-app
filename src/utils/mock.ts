import { Colors } from '@lib/ui/types/theme';

import { DateTime } from 'luxon';

export const agendaMockEvents = (colors: Colors) => [
  {
    title: 'Fisica 1',
    live: true,
    type: 'Lesson',
    color: colors.info[500],
    startsAt: DateTime.local(2022, 10, 9),
    endsAt: DateTime.local(2022, 10, 9).plus({ hours: 1 }),
    description: 'Event description text test',
  },
  {
    title: 'Fisica 1',
    live: false,
    type: 'Lesson',
    color: colors.info[500],
    startsAt: DateTime.local(2022, 10, 9),
    endsAt: DateTime.local(2022, 10, 9).plus({ hours: 2 }),
    description: 'Event description text test',
  },
  {
    title: 'Fisica 1',
    live: false,
    type: 'Lesson',
    color: colors.info[500],
    startsAt: DateTime.local(2022, 10, 9),
    endsAt: DateTime.local(2022, 10, 9).plus({ hours: 1 }),
    description: 'Event description text test',
  },
  {
    title: 'Fisica 1',
    live: true,
    type: 'Lesson',
    color: colors.info[500],
    startsAt: DateTime.local(2022, 10, 10),
    endsAt: DateTime.local(2022, 10, 10).plus({ hours: 1 }),
    description: 'Event description text test',
  },
  {
    title: 'Fisica 1',
    live: true,
    type: 'Lesson',
    color: colors.info[500],
    startsAt: DateTime.local(2022, 10, 10),
    endsAt: DateTime.local(2022, 10, 10).plus({ hours: 1 }),
    description: 'Event description text test',
  },
  {
    title: 'Fisica 1',
    live: true,
    type: 'Lesson',
    color: colors.info[500],
    startsAt: DateTime.local(2022, 10, 11),
    endsAt: DateTime.local(2022, 10, 11).plus({ hours: 1 }),
    description: 'Event description text test',
  },
  {
    title: 'Fisica 1',
    live: true,
    type: 'Lesson',
    color: colors.info[500],
    startsAt: DateTime.local(2022, 10, 11),
    endsAt: DateTime.local(2022, 10, 11).plus({ hours: 1 }),
    description: 'Event description text test',
  },
];
