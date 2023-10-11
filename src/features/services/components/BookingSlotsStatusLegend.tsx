import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PillDropdownActivator } from '@lib/ui/components/PillDropdownActivator';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';

export const BookingSlotsStatusLegend = () => {
  const { t } = useTranslation();
  const { spacing, palettes } = useTheme();
  return (
    <MenuView
      actions={[
        {
          title: t('bookingScreen.bookingStatus.notAvailable'),
          id: 'notAvailable',
          image: 'circle.fill',
          imageColor: palettes.secondary['400'],
        },
        {
          title: t('bookingScreen.bookingStatus.available'),
          id: 'available',
          image: 'circle.fill',
          imageColor: palettes.primary['400'],
        },
        {
          title: t('bookingScreen.bookingStatus.booked'),
          id: 'booked',
          image: 'circle.fill',
          imageColor: palettes.green['500'],
        },
        {
          title: t('bookingScreen.bookingStatus.full'),
          id: 'full',
          image: 'circle.fill',
          imageColor: palettes.danger['500'],
        },
      ]}
    >
      <PillDropdownActivator variant="neutral">
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: spacing[2],
            alignItems: 'center',
          }}
        >
          <Text key="events">{t('common.legend')}</Text>
        </View>
      </PillDropdownActivator>
    </MenuView>
  );
};
