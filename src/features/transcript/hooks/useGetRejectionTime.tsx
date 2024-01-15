import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  rejectingExpiresAt?: Date;
  isCompact?: boolean;
};

export const useGetRejectionTime = ({
  rejectingExpiresAt,
  isCompact = false,
}: Props) => {
  const { t } = useTranslation();

  const getRemainingTime = useCallback(() => {
    if (!rejectingExpiresAt) return '';

    const now = new Date();
    const diff = rejectingExpiresAt.getTime() - now.getTime();
    if (diff < 0) {
      return t('transcriptGradesScreen.expiredCountdown');
    }

    let time = t('transcriptGradesScreen.rejectionCountdown');

    const hours = Math.floor(diff / (1000 * 60 * 60));

    // count hours
    if (hours > 0) {
      time += ` ${hours} ${t('common.hours').toLowerCase()}`;
    }

    if (hours === 0 || !isCompact) {
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      time += ` ${minutes} ${t('common.minutes').toLowerCase()}`;
    }

    return time;
  }, [rejectingExpiresAt, t, isCompact]);

  const [remainingTime, setRemainingTime] = useState<string>(
    getRemainingTime(),
  );
  useEffect(() => {
    if (!rejectingExpiresAt) return;

    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [getRemainingTime, rejectingExpiresAt]);

  return remainingTime;
};
