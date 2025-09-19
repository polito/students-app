import { useEffect, useState } from 'react';

import { DateTime } from 'luxon';

import { APP_TIMEZONE } from '../../../../src/utils/dates';

export function useNow(enabled: boolean) {
  const [now, setNow] = useState(DateTime.now().setZone(APP_TIMEZONE));

  useEffect(() => {
    if (!enabled) {
      return () => {};
    }
    const pid = setInterval(
      () => setNow(DateTime.now().setZone(APP_TIMEZONE)),
      60 * 1000,
    );
    return () => clearInterval(pid);
  }, [enabled]);

  return {
    now,
  };
}
