import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const PlacesScreen = () => {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView>
      <Text variant="heading" style={{ padding: spacing[4] }}>
        {t('placesScreen.title')}
      </Text>
    </SafeAreaView>
  );
};
