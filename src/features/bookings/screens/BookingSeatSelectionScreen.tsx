import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { faSeat } from '@lib/ui/icons/faSeat';
import { Theme } from '@lib/ui/types/Theme';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { BookingSeatCell as BookingSeatCellType } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { isEmpty } from 'lodash';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useScreenReader } from '../../../core/hooks/useScreenReader';
import { useGetBookingSeats } from '../../../core/queries/bookingHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { BookingDeskCell } from '../components/BookingDeskCell';
import { BookingField } from '../components/BookingField';
import { BookingSeatCell } from '../components/BookingSeatCell';
import { BookingSeatsCta } from '../components/BookingSeatsCta';
import { maxSeatZoom, minBookableCellSize, minSeatZoom } from '../constant';
import { useCalculateSeatsDimension } from '../hooks/useCalculateSeatsDimension';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'BookingSeatSelection'
>;
export const BookingSeatSelectionScreen = ({ route }: Props) => {
  const { slotId, topicId, hasSeatSelection, startHour, endHour, day } =
    route.params;
  const { t } = useTranslation();
  const bookingSeatsQuery = useGetBookingSeats(topicId, slotId);
  const styles = useStylesheet(createStyles);
  const [seat, setSeat] = useState<BookingSeatCellType | undefined>(undefined);
  const [viewHeight, setViewHeight] = useState<number | undefined>();
  const { setFeedback } = useFeedbackContext();
  const headerHeight = useHeaderHeight();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { isEnabled } = useScreenReader();
  const currentZoom = useRef(minSeatZoom);
  const { seatSize, gap } = useCalculateSeatsDimension(
    bookingSeatsQuery.data,
    viewHeight,
  );

  useEffect(() => {
    if (
      isEnabled &&
      bookingSeatsQuery.data &&
      bookingSeatsQuery?.data?.rows?.length > 0
    ) {
      const firstAvailableSeat = bookingSeatsQuery.data?.rows?.find(row =>
        row.seats?.some(seatCell => seatCell.status === 'available'),
      );
      if (firstAvailableSeat) {
        const cell = firstAvailableSeat.seats?.find(
          seatCell => seatCell.status === 'available',
        );
        cell && setSeat(cell);
      }
    }
  }, [bookingSeatsQuery.data, isEnabled]);

  const isSeatSizeValidForBooking = () => {
    const currentSeatSize = seatSize * currentZoom.current;
    if (currentSeatSize < minBookableCellSize) {
      setFeedback({
        text: t('bookingSeatScreen.zoomInToEnableSeatSelection'),
      });
      return false;
    }
    return true;
  };

  return (
    <View
      style={StyleSheet.compose(styles.screenWrapper, {
        marginTop: Platform.select({
          ios: headerHeight,
          android: 0,
        }),
      })}
    >
      <View
        style={StyleSheet.compose(styles.zoomableViewContainer, {
          height: viewHeight,
        })}
        onLayout={e => setViewHeight(Math.round(e.nativeEvent.layout.height))}
      >
        <ReactNativeZoomableView
          maxZoom={maxSeatZoom}
          minZoom={minSeatZoom}
          bindToBorders={true}
          contentWidth={SCREEN_WIDTH}
          contentHeight={viewHeight}
          disablePanOnInitialZoom={true}
          onTransform={zoomableViewEventObject => {
            currentZoom.current = zoomableViewEventObject.zoomLevel;
          }}
          doubleTapZoomToCenter={true}
          visualTouchFeedbackEnabled={true}
          onDoubleTapAfter={(_, zoomableViewEventObject) => {
            currentZoom.current = zoomableViewEventObject.zoomLevel;
          }}
          onZoomEnd={(_, _g, zoomableViewEventObject) => {
            currentZoom.current = zoomableViewEventObject.zoomLevel;
          }}
          onSingleTap={() => isSeatSizeValidForBooking()}
        >
          <View
            style={StyleSheet.compose(styles.rowsContainer, {
              height: viewHeight,
              gap,
            })}
          >
            {!isEmpty(bookingSeatsQuery.data?.rows) && (
              <Row
                align="center"
                justify="center"
                key="desk"
                style={{ width: SCREEN_WIDTH, gap }}
              >
                <BookingDeskCell seatSize={seatSize} />
              </Row>
            )}
            {bookingSeatsQuery.data?.rows?.map((row, index) => (
              <Row align="center" key={`row-${index}`} style={{ gap: gap }}>
                {row?.seats?.map(seatCell => (
                  <BookingSeatCell
                    seat={seatCell}
                    size={seatSize}
                    isSelected={seat?.id === seatCell.id}
                    key={seatCell.id}
                    disabled={seatCell.status !== 'available'}
                    onPress={() => {
                      if (isSeatSizeValidForBooking()) {
                        seat?.id === seatCell.id
                          ? setSeat(undefined)
                          : setSeat(seatCell);
                      }
                    }}
                  />
                ))}
              </Row>
            ))}
          </View>
        </ReactNativeZoomableView>
      </View>
      <BookingSeatsCta
        seatId={seat?.id?.toString()}
        slotId={slotId}
        absolute={false}
        modal={false}
        hasSeatSelection={hasSeatSelection}
        style={[styles.ctaButtonContainer, { bottom: bottomTabBarHeight }]}
      >
        <Row gap={2} style={styles.recapContainer}>
          <BookingField
            icon={faSeat}
            label={t('common.seat')}
            value={seat?.label}
            emptyText={t('bookingSeatScreen.noSeatSelected')}
          />
          <BookingField
            icon={faClock}
            label={t('common.hour')}
            value={`${startHour} - ${endHour}`}
          />
          <BookingField icon={faCalendar} value={day} label={t('common.day')} />
        </Row>
      </BookingSeatsCta>
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
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column',
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
  });
