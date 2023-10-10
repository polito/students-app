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

import { faLocation } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
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
import { BookingTimeDetail } from '../../services/components/BookingTimeDetail';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Booking'>;

const bookingLocationHasValidCoordinates = (
  location: Booking['locationCheck'],
) => {
  return !!location?.latitude && !!location?.longitude && !!location.radiusInKm;
};

const checkInEnabled = (booking?: Booking) => {
  return (
    booking?.startsAt &&
    isToday(DateTime.fromJSDate(booking?.startsAt)) &&
    booking?.locationCheck?.enabled &&
    !booking?.locationCheck?.checked &&
    bookingLocationHasValidCoordinates(booking?.locationCheck)
  );
};

export const BookingScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const { getCurrentPosition, computeDistance } = useGeolocation();
  const { colors, palettes, spacing } = useTheme();
  const bookingsQuery = useGetBookings();
  const bookingMutation = useDeleteBooking(id);
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

  const showCheckIn = useMemo(() => checkInEnabled(booking), [booking]);

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
        console.debug({ bookingId: booking.id, isLocationChecked: true });
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
      setFeedback({ text: t('bookingScreen.cancelFeedback') });
      return bookingMutation
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
            {booking && <BookingTimeDetail booking={booking} />}
          </View>
          {booking?.location?.name && (
            <OverviewList>
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
            </OverviewList>
          )}
          <Section style={{ marginTop: spacing[4] }} mb={0} accessible>
            <SectionHeader
              title={t('bookingScreen.barCodeTitle')}
              accessible={false}
            />
            <Card style={styles.barCodeCard} rounded>
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
          {showCheckIn && (
            <CtaButton
              title={t('bookingScreen.checkIn')}
              action={onPressCheckIn}
              loading={updateBookingMutation.isLoading}
              outlined
              absolute={false}
              disabled={isDisabled}
            />
          )}
          <CtaButtonSpacer />
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      {canBeCancelled && (
        <CtaButton
          title={t('bookingScreen.cancelBooking')}
          action={onPressDelete}
          disabled={isDisabled}
          destructive={true}
          loading={bookingMutation.isLoading}
        />
      )}
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
      borderRadius: fontSizes.md,
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
  });
