import { useTranslation } from 'react-i18next';

import { faCouch } from '@fortawesome/free-solid-svg-icons';

import { EmptyCard } from './EmptyCard';

type EmptyWeekProps = {
  message?: string;
};
export const EmptyWeek = ({ message }: EmptyWeekProps) => {
  const { t } = useTranslation();

  return (
    <EmptyCard
      icon={faCouch}
      message={message ?? t('agendaScreen.emptyWeek')}
    />
  );
};
