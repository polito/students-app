import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';

import { Icon } from '@lib/ui/components/Icon';
import { PillButton } from '@lib/ui/components/PillButton';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { faSeat } from '@lib/ui/icons/faSeat';
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
          image: Platform.select({
            ios: 'circle.fill',
            android: 'circle',
          }),
          imageColor: palettes.secondary['400'],
        },
        {
          title: t('bookingScreen.bookingStatus.available'),
          id: 'available',
          image: Platform.select({
            ios: 'circle.fill',
            android: 'circle',
          }),
          imageColor: palettes.primary['400'],
        },
        {
          title: t('bookingScreen.bookingStatus.booked'),
          id: 'booked',
          image: Platform.select({
            ios: 'circle.fill',
            android: 'circle',
          }),
          imageColor: palettes.green['500'],
        },
        {
          title: t('bookingScreen.bookingStatus.full'),
          id: 'full',
          image: Platform.select({
            ios: 'circle.fill',
            android: 'circle',
          }),
          imageColor: palettes.danger['500'],
        },
      ]}
    >
      <PillButton variant="neutral" accessibilityLabel={t('common.legend')}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: spacing[2],
            alignItems: 'center',
          }}
        >
          <Icon icon={faSeat} />
          <Text key="events">{t('common.legend')}</Text>
        </View>
      </PillButton>
    </MenuView>
  );
};
