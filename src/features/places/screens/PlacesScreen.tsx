import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const PlacesScreen = () => {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView>
      <ScrollView>
        <Text variant="heading" style={{ padding: spacing[4] }}>
          {t('placesScreen.title')}
        </Text>
        <EmptyState
          icon={faTriangleExclamation}
          message={t('common.comingSoon')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
