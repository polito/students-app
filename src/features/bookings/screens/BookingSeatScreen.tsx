import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { faChair } from '@fortawesome/free-solid-svg-icons';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Booking } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useDeleteBooking,
  useGetBookingSeats,
  useGetBookings,
} from '../../../core/queries/bookingHooks';
import { canBeCancelled } from '../../../utils/bookings';
import { AgendaStackParamList } from '../../agenda/components/AgendaNavigator';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { BookingField } from '../components/BookingField';
import { BookingSeatCell } from '../components/BookingSeatCell';

type Props = NativeStackScreenProps<
  AgendaStackParamList | ServiceStackParamList,
  'BookingSeat'
>;

export const BookingSeatScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const { topicId, slotId, seatId, bookingId } = route.params;
  const { spacing } = useTheme();
  const bookingSeatsQuery = useGetBookingSeats(topicId, slotId);
  const styles = useStylesheet(createStyles);
  const [viewHeight, setViewHeight] = useState<number | undefined>();
  const [seatSize, setSeatSize] = useState(0);
  const bookingsQuery = useGetBookings();
  const headerHeight = useHeaderHeight();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const booking = bookingsQuery.data?.find((e: Booking) => e.id === bookingId);
  const deleteBookingMutation = useDeleteBooking(bookingId);
  const confirmCancel = useConfirmationDialog({
    title: t('bookingScreen.cancelBooking'),
    message: t('bookingScreen.cancelBookingText'),
  });
  const isDisabled = useOfflineDisabled();
  const { setFeedback } = useFeedbackContext();

  const bookingStartAtTime =
    booking?.startsAt &&
    DateTime.fromJSDate(booking?.startsAt).toFormat('HH:mm');
  const bookingEndsAtTime =
    booking?.endsAt && DateTime.fromJSDate(booking?.endsAt).toFormat('HH:mm');
  const bookingDay =
    booking?.startsAt &&
    DateTime.fromJSDate(booking?.endsAt).toFormat('d MMMM');

  useEffect(() => {
    if (viewHeight && bookingSeatsQuery.data) {
      const numberOfRows = bookingSeatsQuery.data.rows.length;
      const minSeatSize = Math.round(
        (viewHeight - spacing[2] * 2 * numberOfRows) / numberOfRows,
      );
      setSeatSize(minSeatSize);
    }
  }, [bookingSeatsQuery.data, spacing, viewHeight]);

  const cancelEnabled = useMemo(() => canBeCancelled(booking), [booking]);

  const onPressDelete = async () => {
    if (await confirmCancel()) {
      setFeedback({ text: t('bookingScreen.cancelFeedback') });
      return deleteBookingMutation
        .mutateAsync()
        .then(() => navigation.goBack())
        .then(() => setFeedback({ text: t('bookingScreen.cancelFeedback') }));
    }
  };

  return (
    <View
      style={StyleSheet.compose(styles.screenWrapper, {
        marginTop: headerHeight,
      })}
    >
      <View
        style={StyleSheet.compose(styles.zoomableViewContainer, {
          height: viewHeight,
        })}
        onLayout={e => setViewHeight(Math.round(e.nativeEvent.layout.height))}
      >
        <ReactNativeZoomableView
          contentWidth={SCREEN_WIDTH}
          contentHeight={viewHeight}
          bindToBorders={true}
          maxZoom={2}
          minZoom={1}
        >
          <Col
            gap={2}
            align="flex-start"
            justify="flex-start"
            style={StyleSheet.compose(styles.rowsContainer, {
              height: viewHeight,
            })}
          >
            {bookingSeatsQuery.data?.rows?.map((row, index) => (
              <Row align="center" key={`row-${index}`} gap={2}>
                {row?.seats?.map(seatCell => (
                  <BookingSeatCell
                    seat={seatCell}
                    size={seatSize}
                    isSelected={seatId === seatCell.id}
                    key={seatCell.id}
                  />
                ))}
              </Row>
            ))}
          </Col>
        </ReactNativeZoomableView>
      </View>
      <CtaButtonContainer
        absolute={false}
        style={[styles.ctaButtonContainer, { bottom: bottomTabBarHeight }]}
      >
        <Row gap={4} style={styles.recapContainer}>
          <BookingField
            icon={faChair}
            label={t('common.seat')}
            value={`${booking?.seat?.row}${booking?.seat?.column}`}
            emptyText={t('bookingSeatScreen.noSeatSelected')}
          />
          <BookingField
            icon={faClock}
            label={t('common.hour')}
            value={`${bookingStartAtTime} - ${bookingEndsAtTime}`}
          />
          <BookingField
            icon={faCalendar}
            value={bookingDay}
            label={t('common.day')}
          />
        </Row>
        {cancelEnabled && (
          <CtaButton
            title={t('bookingScreen.cancelBooking')}
            action={onPressDelete}
            loading={deleteBookingMutation.isLoading}
            absolute={false}
            disabled={isDisabled || deleteBookingMutation.isLoading}
            destructive={true}
          />
        )}
      </CtaButtonContainer>
    </View>
  );
};

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    zoomableViewContainer: {
      flex: 1,
      width: SCREEN_WIDTH,
    },
    rowsContainer: {
      padding: spacing[2],
      width: '100%',
      backgroundColor: colors.surface,
    },
    recapContainer: {
      marginHorizontal: spacing[4],
    },
    ctaButtonContainer: {
      backgroundColor: colors.surface,
      paddingBottom: 0,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    container: {
      backgroundColor: colors.surface,
      paddingTop: spacing[2],
    },
  });