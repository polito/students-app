import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { faChair } from '@fortawesome/free-solid-svg-icons';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { BookingSeatCell as BookingSeatCellType } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useGetBookingSeats } from '../../../core/queries/bookingHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { BookingField } from '../components/BookingField';
import { BookingSeatCell } from '../components/BookingSeatCell';
import { BookingSeatsCta } from '../components/BookingSeatsCta';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'BookingSeatSelection'
>;

const minBookableCellSize = 25;
const minZoom = 1;
const maxZoom = 3;

export const BookingSeatSelectionScreen = ({ route }: Props) => {
  const { slotId, topicId, hasSeats, startHour, endHour, day } = route.params;
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const bookingSeatsQuery = useGetBookingSeats(topicId, slotId);
  const styles = useStylesheet(createStyles);
  const [seat, setSeat] = useState<BookingSeatCellType | undefined>(undefined);
  const [viewHeight, setViewHeight] = useState<number | undefined>();
  const [seatSize, setSeatSize] = useState(0);
  const { setFeedback } = useFeedbackContext();
  const headerHeight = useHeaderHeight();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const currentZoom = useRef(minZoom);

  useEffect(() => {
    if (bookingSeatsQuery.data && viewHeight) {
      const numberOfRows = bookingSeatsQuery.data.rows.length;
      const minSeatSize = Math.round(
        (viewHeight - spacing[2] * 2 * numberOfRows) / numberOfRows,
      );
      setSeatSize(minSeatSize);
    }
  }, [bookingSeatsQuery.data, spacing, viewHeight]);

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
          maxZoom={maxZoom}
          minZoom={minZoom}
          bindToBorders={true}
          contentWidth={SCREEN_WIDTH}
          contentHeight={viewHeight}
          onTransform={zoomableViewEventObject => {
            currentZoom.current = zoomableViewEventObject.zoomLevel;
          }}
          onDoubleTapAfter={(_, zoomableViewEventObject) => {
            currentZoom.current = zoomableViewEventObject.zoomLevel;
          }}
          onZoomEnd={(_, _g, zoomableViewEventObject) => {
            currentZoom.current = zoomableViewEventObject.zoomLevel;
          }}
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
                    isSelected={seat?.id === seatCell.id}
                    key={seatCell.id}
                    disabled={seatCell.status !== 'available'}
                    onPress={() => {
                      const currentSeatSize = seatSize * currentZoom.current;
                      if (currentSeatSize < minBookableCellSize) {
                        setFeedback({
                          text: t(
                            'bookingSeatScreen.zoomInToEnableSeatSelection',
                          ),
                        });
                        return;
                      }
                      seat?.id === seatCell.id
                        ? setSeat(undefined)
                        : setSeat(seatCell);
                    }}
                  />
                ))}
              </Row>
            ))}
          </Col>
        </ReactNativeZoomableView>
      </View>
      <BookingSeatsCta
        seatId={seat?.id?.toString()}
        slotId={slotId}
        absolute={false}
        modal={false}
        hasSeats={hasSeats}
        style={[styles.ctaButtonContainer, { bottom: bottomTabBarHeight }]}
      >
        <Row gap={2} style={styles.recapContainer}>
          <BookingField
            icon={faChair}
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
