import { useTranslation } from 'react-i18next';

import { Dialog } from '~/core/components/Dialog';

export const useAgendaDialog = () => {
  const { t } = useTranslation();

  const hideEvent = (
    onHideThis: () => void,
    onHideThisAndFuture: () => void,
  ) => {
    Dialog.multiChoiceDialog(
      t('agendaDialog.hideEventTitle'),
      t('agendaDialog.hideEventMessage'),
      [
        {
          text: t('agendaDialog.hideThisEvent'),
          onPress: onHideThis,
        },
        {
          text: t('agendaDialog.hideThisAndFutureEvents'),
          onPress: onHideThisAndFuture,
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
    );
  };

  return {
    hideEvent,
  };
};
