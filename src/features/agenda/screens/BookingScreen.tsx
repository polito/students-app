import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { weekDay } from '../../../utils';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Booking'>;

export const BookingScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarHeight = useBottomTabBarHeight();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const bookingsQuery = useGetBookings();
  const styles = useStylesheet(createStyles);
  const booking = bookingsQuery.data?.data.find(e => e.id === id);
  const routes = navigation.getState()?.routes;

  console.log('booking', booking);
  const title = booking?.topic?.title;

  const timeLabel = useMemo(() => {
    const fromDate = DateTime.fromISO(booking.startsAt.toISOString()).toFormat(
      'HH:mm',
    );
    const toDate = DateTime.fromISO(booking.endsAt.toISOString()).toFormat(
      'HH:mm',
    );
    return `${weekDay(booking.startsAt, t)},  ${fromDate} - ${toDate}`;
  }, [booking]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
      }}
      refreshControl={createRefreshControl(bookingsQuery)}
      style={styles.wrapper}
    >
      <Text variant={'title'}>{title}</Text>
      <Text variant={'secondaryText'} style={styles.booking}>
        {t('Booking')}
      </Text>
      <Text style={styles.time}>{timeLabel}</Text>
    </ScrollView>
  );
};

const createStyles = ({ spacing, colors, size }: Theme) =>
  StyleSheet.create({
    wrapper: {
      marginTop: size.xs,
      padding: size.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: size.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
