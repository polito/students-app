import { useTranslation } from 'react-i18next';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={faTriangleExclamation}
      iconColor={colors.orange[600]}
      message={t('common.comingSoon')}
    />
  );
};
