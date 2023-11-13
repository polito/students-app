import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Barcode from 'react-native-barcode-svg';

import { faCheckCircle, faLocation } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { faSeat } from '@lib/ui/icons/faSeat';
import { Theme } from '@lib/ui/types/Theme';
import { isToday } from '@lib/ui/utils/calendar';
import { Booking } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useGeolocation } from '../../../core/hooks/useGeolocation';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useDeleteBooking,
  useGetBookings,
  useUpdateBooking,
} from '../../../core/queries/bookingHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { BookingDateTime } from '../../bookings/components/BookingDateTime';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<
  AgendaStackParamList | ServiceStackParamList,
  'Booking'
>;

const bookingLocationHasValidCoordinates = (
  location: Booking['locationCheck'],
) => {
  return !!location?.latitude && !!location?.longitude && !!location.radiusInKm;
};

export const BookingScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const { getCurrentPosition, computeDistance } = useGeolocation();
  const { colors, palettes, spacing } = useTheme();
  const bookingsQuery = useGetBookings();
  const deleteBookingMutation = useDeleteBooking(id);
  const updateBookingMutation = useUpdateBooking();
  const studentQuery = useGetStudent();
  const confirmCancel = useConfirmationDialog({
    title: t('bookingScreen.cancelBooking'),
    message: t('bookingScreen.cancelBookingText'),
  });
  const isDisabled = useOfflineDisabled();
  const styles = useStylesheet(createStyles);
  const booking = bookingsQuery.data?.find((e: Booking) => e.id === id);
  const title = booking?.topic?.title ?? '';
  const subTopicTitle = booking?.subtopic?.title ?? '';

  const hasCheckIn = useMemo(
    () =>
      booking?.startsAt &&
      isToday(DateTime.fromJSDate(booking?.startsAt)) &&
      booking?.locationCheck?.enabled &&
      bookingLocationHasValidCoordinates(booking?.locationCheck),
    [booking],
  );

  const completedCheckIn = useMemo(
    () => hasCheckIn && booking?.locationCheck?.checked,
    [booking?.locationCheck?.checked, hasCheckIn],
  );

  const canBeCancelled = useMemo(
    () =>
      !!booking?.cancelableUntil &&
      booking?.cancelableUntil.getTime() > Date.now(),
    [booking],
  );

  const onPressCheckIn = async () => {
    if (!booking?.id) return;
    getCurrentPosition().then(currentDeviceCoordinates => {
      const computedDistance = computeDistance(currentDeviceCoordinates, {
        latitude: Number(booking?.locationCheck?.latitude),
        longitude: Number(booking?.locationCheck?.longitude),
      });
      if (computedDistance < Number(booking?.locationCheck?.radiusInKm)) {
        updateBookingMutation
          .mutateAsync({
            bookingId: booking.id,
            isLocationChecked: true,
          })
          .then(() => {
            setFeedback({ text: t('bookingScreen.checkInFeedback') });
          });
      } else {
        setFeedback({ text: t('bookingScreen.checkLocationErrorFeedback') });
      }
    });
  };

  const onPressLocation = async (location: Booking['location']) => {
    if (location.type === 'virtualPlace') {
      await Linking.openURL(location.url);
    }
  };

  const onPressDelete = async () => {
    if (await confirmCancel()) {
      return deleteBookingMutation
        .mutateAsync()
        .then(() => navigation.goBack())
        .then(() => setFeedback({ text: t('bookingScreen.cancelFeedback') }));
    }
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl manual queries={[bookingsQuery]} />}
      >
        <SafeAreaView>
          <View style={{ padding: spacing[5] }} accessible>
            <ScreenTitle style={{ marginBottom: spacing[2] }} title={title} />
            {subTopicTitle && (
              <Text variant="caption" style={{ marginBottom: spacing[1] }}>
                {subTopicTitle}
              </Text>
            )}
            <BookingDateTime accessible={true} booking={booking} />
          </View>
          <OverviewList>
            {booking?.location?.name && (
              <ListItem
                leadingItem={
                  <Icon
                    icon={faLocation}
                    size={20}
                    color={colors.secondaryText}
                    style={{ marginRight: spacing[2] }}
                  />
                }
                title={booking.location.name}
                subtitle={t(
                  `bookingScreen.locationType.${booking.location?.type}`,
                )}
                onPress={() => onPressLocation(booking?.location)}
              />
            )}
            {!!booking && !!booking?.seat && (
              <ListItem
                accessibilityRole="button"
                leadingItem={
                  <Icon
                    icon={faSeat}
                    size={20}
                    color={colors.secondaryText}
                    style={{ marginRight: spacing[2] }}
                  />
                }
                title={`${booking.seat.row}${booking.seat.column}`}
                subtitle={t('common.seat')}
                onPress={() =>
                  booking?.seat?.id &&
                  booking?.id &&
                  navigation.navigate('BookingSeat', {
                    bookingId: booking.id,
                    slotId: String(booking?.id),
                    seatId: booking?.seat?.id,
                    topicId: booking.subtopic?.id || booking.topic.id,
                  })
                }
                isAction
              />
            )}
          </OverviewList>
          <Section style={{ marginTop: spacing[4] }} mb={0} accessible>
            <SectionHeader
              title={t('bookingScreen.barCodeTitle')}
              accessible={false}
            />
            <Card style={styles.barCodeCard} spaced>
              {studentQuery.data && (
                <Barcode
                  value={studentQuery.data.username}
                  format="CODE128"
                  height={85}
                  lineColor={palettes.primary[800]}
                  singleBarWidth={1.8}
                  backgroundColor="white"
                />
              )}
            </Card>
          </Section>
          {hasCheckIn && <CtaButtonSpacer />}
          {canBeCancelled && <CtaButtonSpacer />}
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      <CtaButtonContainer absolute={true}>
        {hasCheckIn && (
          <CtaButton
            title={
              completedCheckIn
                ? t('bookingScreen.checkInFeedback')
                : t('bookingScreen.checkIn')
            }
            action={onPressCheckIn}
            loading={updateBookingMutation.isLoading}
            variant="outlined"
            icon={completedCheckIn ? faCheckCircle : undefined}
            absolute={false}
            success={completedCheckIn}
            disabled={
              isDisabled || updateBookingMutation.isLoading || completedCheckIn
            }
            containerStyle={{ paddingVertical: 0 }}
          />
        )}
        {canBeCancelled && (
          <CtaButton
            title={t('bookingScreen.cancelBooking')}
            action={onPressDelete}
            loading={deleteBookingMutation.isLoading}
            absolute={false}
            disabled={isDisabled || deleteBookingMutation.isLoading}
            destructive={true}
            containerStyle={{ paddingVertical: 0 }}
          />
        )}
      </CtaButtonContainer>
    </>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    barCodeCard: {
      padding: fontSizes.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
  });
