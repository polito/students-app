import { DateTime, Interval } from 'luxon';
import SuperJSON from 'superjson';

export const extendSuperJSON = () => {
  SuperJSON.registerCustom<Interval, string>(
    {
      isApplicable: (v): v is Interval => Interval.isInterval(v),
      serialize: v => `${v.start?.toISO()}/${v.end?.toISO()}`,
      deserialize: v => Interval.fromISO(v),
    },
    'luxon/Interval',
  );

  SuperJSON.registerCustom<DateTime, string>(
    {
      isApplicable: (v): v is DateTime => DateTime.isDateTime(v),
      serialize: v => v.toJSON()!,
      deserialize: v => DateTime.fromISO(v),
    },
    'luxon/DateTime',
  );
};
