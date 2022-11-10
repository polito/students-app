import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import Barcode from 'react-native-barcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';

import { Card } from '@lib/ui/components/Card';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { Separator } from '@lib/ui/components/Separator';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { Booking } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useDeleteBooking,
  useGetBookings,
} from '../../../core/queries/bookingHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { fromDateToFormat, weekDay } from '../../../utils';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Booking'>;

export const BookingScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarHeight = useBottomTabBarHeight();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const bookingsQuery = useGetBookings();
  const bookingMutation = useDeleteBooking(id);
  const studentQuery = useGetStudent();
  const styles = useStylesheet(createStyles);
  const booking = bookingsQuery.data?.data.find((e: Booking) => e.id === id);
  console.log('booking', booking);
  console.log('booking', id);
  const title = booking?.topic?.title;
  const timeLabel = useMemo(() => {
    const fromDate = fromDateToFormat(booking?.startsAt);
    const toDate = fromDateToFormat(booking?.endsAt);
    const day = booking?.startsAt ? `${weekDay(booking.startsAt, t)}, ` : '';
    return `${day}  ${fromDate} - ${toDate}`;
  }, [booking]);

  const onPressLocation = () => {
    console.log('onPressLocation');
  };

  const onPressDelete = () => {
    bookingMutation.mutate();
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
        }}
        refreshControl={createRefreshControl(bookingsQuery)}
        style={styles.wrapper}
      >
        <EventDetails title={title} type={t('Booking')} timeLabel={timeLabel} />
        <SectionList>
          <ListItem
            leadingItem={
              <Icon
                name="location"
                style={{ color: colors.secondaryText, marginRight: spacing[2] }}
                size={fontSizes['2xl']}
              />
            }
            title={booking?.location?.name}
            subtitle={booking?.location?.type}
            onPress={onPressLocation}
          />
        </SectionList>
        <Section style={styles.sectionSeparator}>
          <Separator />
          <Text variant={'caption'}>{t('Barcode')}</Text>
        </Section>
        <Section style={styles.sectionContainer}>
          <Card style={styles.barCodeCard} rounded>
            <Barcode
              value={studentQuery.data.data.username}
              format="CODE128"
              height={85}
              lineColor={colors.primary[800]}
              singleBarWidth={1.8}
              backgroundColor={'white'}
            />
          </Card>
        </Section>
      </ScrollView>
      {/* {bookingMutation.isIdle && (*/}
      <View
        style={{
          ...styles.bottomRow,
          marginBottom: bottomBarHeight,
        }}
      >
        <CtaButton
          icon={'close'}
          title={t('Delete Booking')}
          onPress={onPressDelete}
          loading={bookingMutation.isLoading}
          success={bookingMutation.isSuccess}
          successMessage={t('Exam booked')}
          onSuccess={() => navigation.goBack()}
        />
      </View>
      {/* )}*/}
    </>
  );
};

const createStyles = ({ spacing, colors, size }: Theme) =>
  StyleSheet.create({
    bottomRow: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing[4],
    },
    barcode: {},
    barCodeCard: {
      width: '100%',
      padding: size.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: size.md,
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    sectionSeparator: {
      paddingHorizontal: size.lg,
      marginTop: size.xs,
    },
    sectionContainer: {
      paddingHorizontal: size.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      marginTop: size.xs,
      // padding: size.sm,
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
