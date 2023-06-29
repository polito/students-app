import { useEffect, useState } from 'react';

import { DateTime } from 'luxon';

export function useNow(enabled: boolean) {
  const [now, setNow] = useState(DateTime.now());

  useEffect(() => {
    if (!enabled) {
      return () => {};
    }
    const pid = setInterval(() => setNow(DateTime.now()), 60 * 1000);
    return () => clearInterval(pid);
  }, [enabled]);

  return {
    now,
  };
}
