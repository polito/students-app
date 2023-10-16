import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DateTime } from 'luxon';

import { AgendaItem } from '../../agenda/types/AgendaItem';

export const useFormatAgendaItem = () => {
  const { t } = useTranslation();
  const now = DateTime.now();
  return useCallback(
    (agendaItem: AgendaItem, ellipsize = false) =>
      `${
        !ellipsize || agendaItem.title.length < 10
          ? agendaItem.title
          : agendaItem.title.substring(0, 8) + '...'
      } @ ${
        agendaItem.start <= now && agendaItem.end >= now
          ? t('common.now')
          : agendaItem.start.toFormat('hh:mm')
      }`,
    [now, t],
  );
};
