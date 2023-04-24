import { useTranslation } from 'react-i18next';

import { faMugHot } from '@fortawesome/free-solid-svg-icons';

import { EmptyCard } from './EmptyCard';

export const EmptyDay = () => {
  const { t } = useTranslation();

  return <EmptyCard message={t('agendaScreen.emptyDay')} icon={faMugHot} />;
};
