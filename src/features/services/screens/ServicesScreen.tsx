import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const ServicesScreen = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView>
      <ScrollView>
        <Text variant="title" style={{ padding: spacing[4] }}>
          {t('common.services')}
        </Text>
        <EmptyState
          icon={faTriangleExclamation}
          iconColor={colors.orange[600]}
          message={t('common.comingSoon')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
