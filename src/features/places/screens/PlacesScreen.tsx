import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const PlacesScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <EmptyState
        icon={faTriangleExclamation}
        iconColor={colors.orange[600]}
        message={t('common.comingSoon')}
      />
    </ScrollView>
  );
};
