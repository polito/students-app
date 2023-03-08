import { useTranslation } from 'react-i18next';

import { faCouch } from '@fortawesome/free-solid-svg-icons';

import { EmptyCard } from './EmptyCard';

export const EmptyWeek = () => {
  const { t } = useTranslation();

  return <EmptyCard icon={faCouch} message={t('agendaScreen.emptyWeek')} />;
};
