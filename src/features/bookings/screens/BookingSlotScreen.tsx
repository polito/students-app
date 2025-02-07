import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { CalendarHeader } from '@lib/ui/components/calendar/CalendarHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { faSeat } from '@lib/ui/icons/faSeat';
import { WeekNum } from '@lib/ui/types/Calendar';
import { Theme } from '@lib/ui/types/Theme';
import { CALENDAR_CELL_HEIGHT } from '@lib/ui/utils/calendar';
import { BookingSlot } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime, IANAZone } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { BottomModal } from '../../../core/components/BottomModal';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useBottomModal } from '../../../core/hooks/useBottomModal';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useGetBookingSlots,
  useGetBookingTopics,
  useGetBookings,
} from '../../../core/queries/bookingHooks';
import {
  MIN_CELL_HEIGHT,
  canBeBookedWithSeatSelection,
  getBookingSlotStatus,
  getBookingStyle,
  getCalendarHours,
  getCalendarPropsFromTopic,
  isPastSlot,
} from '../../../utils/bookings';
import { dateFormatter, formatDate } from '../../../utils/dates';
import { WeekFilter } from '../../agenda/components/WeekFilter';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { BookingSlotModal } from '../components/BookingSlotModal';
import { BookingSlotsStatusLegend } from '../components/BookingSlotsStatusLegend';

type Props = NativeStackScreenProps<ServiceStackParamList, 'BookingSlot'>;

export type BookingCalendarEvent = BookingSlot & {
  start: DateTime;
  end: DateTime;
  duration: number;
  title: string;
};

const START_DATE = DateTime.now().startOf('week');

export const BookingSlotScreen = ({ route, navigation }: Props) => {
  const { topicId } = route.params;
  const { palettes, colors, dark } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const isOffline = useOfflineDisabled();
  const [currentWeekStart, setCurrentWeekStart] = useState(START_DATE);
  const { data: myBookings } = useGetBookings();
  const { data: topics } = useGetBookingTopics();
  const { language } = usePreferencesContext();
  const {
    open: showBottomModal,
    modal: bottomModal,
    close: closeBottomModal,
  } = useBottomModal();
  const [weekEndsOn, setWeeksEndOn] = useState<WeekNum>(5);
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  const { isLoading, isFetching, refetch, isRefetching, ...bookingSlotsQuery } =
    useGetBookingSlots(topicId, currentWeekStart);
  const [calendarHeight, setCalendarHeight] = useState<number | undefined>(
    undefined,
  );
  const formatHHmm = dateFormatter('HH:mm');
  const currentTopic = useMemo(
    () => getCalendarPropsFromTopic(topics, topicId),
    [topics, topicId],
  );

  const mode = currentTopic.agendaView ? 'day' : 'custom';

  const nextWeek = useCallback(
    () =>
      setCurrentWeekStart(oldW => {
        if (currentTopic.agendaView) {
          return oldW.plus({ days: 1 });
        }
        return oldW.plus({ week: 1 });
      }),
    [],
  );

  const prevWeek = useCallback(
    () =>
      setCurrentWeekStart(oldW => {
        if (currentTopic.agendaView) {
          return oldW.minus({ days: 1 });
        }
        return oldW.minus({ week: 1 });
      }),
    [],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={faRedo}
          color={palettes.primary['500']}
          adjustSpacing="left"
          accessibilityLabel={t('common.reset')}
          onPress={() => {
            refetch();
          }}
        />
      ),
    });
  }, [navigation, palettes, t, refetch]);

  const calendarEvents = useMemo(() => {
    if (bookingSlotsQuery.data && bookingSlotsQuery.data?.length > 0) {
      return bookingSlotsQuery.data.map(slot => {
        const start = DateTime.fromJSDate(slot.startsAt as Date, {
          zone: IANAZone.create('Europe/Rome'),
        });
        const end = DateTime.fromJSDate(slot.endsAt as Date, {
          zone: IANAZone.create('Europe/Rome'),
        });
        return {
          ...slot,
          start,
          end,
          duration: end.diff(start, 'minutes')?.minutes,
          title: '',
        };
      });
    }
    return [];
  }, [bookingSlotsQuery.data]);

  const onPressEvent = (event: BookingCalendarEvent) => {
    if (isPastSlot(event)) {
      return;
    }
    if (event.isBooked) {
      const booking = myBookings && myBookings?.find(b => b.id === event.id);
      booking &&
        booking.seat &&
        booking.seat?.id &&
        navigation.navigate('BookingSeat', {
          bookingId: booking.id,
          slotId: String(booking?.id),
          seatId: booking?.seat?.id,
          topicId: booking.subtopic?.id || booking.topic.id,
        });
      booking &&
        !booking?.seat &&
        navigation.navigate('Booking', { id: booking.id });
      return;
    }
    if (canBeBookedWithSeatSelection(event)) {
      event.id &&
        navigation.navigate('BookingSeatSelection', {
          slotId: String(event.id),
          startHour: event.start.toFormat('HH:mm'),
          endHour: event.end.toFormat('HH:mm'),
          day: event.start.toFormat('d MMMM'),
          hasSeatSelection: event.hasSeatSelection,
          topicId,
        });
    } else {
      showBottomModal(
        <BookingSlotModal
          topicId={topicId}
          item={event}
          close={closeBottomModal}
        />,
      );
    }
  };

  const hours = useMemo(() => {
    if (!currentTopic) return [];
    return getCalendarHours(currentTopic?.startHour, currentTopic?.endHour);
  }, [currentTopic]);

  useEffect(() => {
    const newStartDate = currentTopic?.startDate
      ? DateTime.fromJSDate(currentTopic?.startDate, {
          zone: IANAZone.create('Europe/Rome'),
        })
      : START_DATE;
    const newDaysPerWeek = currentTopic?.daysPerWeek as WeekNum;
    setCurrentWeekStart(newStartDate.isValid ? newStartDate : START_DATE);
    setWeeksEndOn(
      newStartDate.plus({ days: newDaysPerWeek - 1 }).weekday as WeekNum,
    );
    setDaysPerWeek(newDaysPerWeek);
  }, [currentTopic]);

  const isPrevWeekDisabled = useMemo(() => {
    return !!(
      isOffline ||
      (currentTopic?.startDate &&
        currentTopic?.startDate.toISOString() === currentWeekStart.toISODate())
    );
  }, [isOffline, currentTopic, currentWeekStart]);

  const onContainerSizeChanged = useCallback(
    (height: number) => {
      if (!currentTopic) return;

      const slotsPerDay =
        currentTopic.slotsPerHour! * (currentTopic.endHour ?? 20) -
        (currentTopic.startHour ?? 8);
      const heightPerSlot = height / slotsPerDay;

      if (heightPerSlot >= MIN_CELL_HEIGHT) {
        setCalendarHeight(height);
      } else {
        setCalendarHeight(MIN_CELL_HEIGHT * slotsPerDay);
      }
    },
    [currentTopic],
  );

  return (
    <>
      <BottomModal dismissable {...bottomModal} />
      <HeaderAccessory justify="space-between">
        <Tabs>
          <BookingSlotsStatusLegend />
        </Tabs>
        <WeekFilter
          current={currentWeekStart}
          getNext={nextWeek}
          getPrev={prevWeek}
          isNextWeekDisabled={isOffline}
          isPrevWeekDisabled={isPrevWeekDisabled}
          daysPerWeek={daysPerWeek - 1}
        />
      </HeaderAccessory>
      <View
        style={styles.calendarContainer}
        onLayout={e => {
          onContainerSizeChanged(e.nativeEvent.layout.height);
        }}
      >
        {(isFetching || isLoading || isRefetching) && (
          <ActivityIndicator size="large" style={styles.loader} />
        )}
        {calendarHeight && (
          <Calendar<BookingCalendarEvent>
            weekStartsOn={currentWeekStart.weekday as WeekNum}
            mode={mode}
            weekEndsOn={weekEndsOn}
            headerContentStyle={styles.dayHeader}
            weekDayHeaderHighlightColor={colors.background}
            calendarCellStyle={styles.eventCellStyle}
            date={currentWeekStart}
            locale={language}
            hours={hours}
            bodyContainerStyle={{ backgroundColor: 'yellow' }}
            cellMaxHeight={currentTopic.slotLength || CALENDAR_CELL_HEIGHT}
            showAllDayEventCell={false}
            swipeEnabled={false}
            renderHeader={props => (
              <CalendarHeader {...props} cellHeight={-1} />
            )}
            onPressEvent={onPressEvent}
            events={calendarEvents}
            height={calendarHeight}
            startHour={currentTopic.startHour || 8}
            renderEvent={(item, touchableOpacityProps) => {
              const isMini = item.duration <= 15;
              const { color, backgroundColor } = getBookingStyle(
                item,
                palettes,
                colors,
                dark,
              );

              const dateStart = formatDate(item?.start.toJSDate());
              const timeStart = formatHHmm(item?.start.toJSDate());
              const timeEnd = formatHHmm(item?.end.toJSDate());
              const timeMessage = ` ${dateStart}, ${t(
                'common.fromTime',
              )} ${timeStart}, ${t('common.toTime')} ${timeEnd}`;
              const accessibilityMessageText = [
                t(
                  getBookingSlotStatus(
                    item,
                    'bookingScreen.bookingStatus.notAvailableBooking',
                  ),
                ),
                timeMessage,
              ].join(', ');

              return (
                <Pressable
                  {...touchableOpacityProps}
                  style={[
                    touchableOpacityProps.style,
                    styles.event,
                    { backgroundColor },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t(accessibilityMessageText)}
                >
                  {!isMini && <Icon icon={faSeat} color={color} />}
                  <Text
                    style={[
                      styles.placesText,
                      { color },
                      { marginTop: isMini ? 0 : undefined },
                    ]}
                  >
                    {item.bookedPlaces} / {item?.places || 0}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
        <BottomBarSpacer />
      </View>
    </>
  );
};

const createStyles = ({
  fontSizes,
  palettes,
  colors,
  spacing,
  fontWeights,
}: Theme) =>
  StyleSheet.create({
    calendarContainer: {
      height: '100%',
      width: '100%',
    },
    modalTitle: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      color: colors.prose,
    },
    placesText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      marginTop: spacing[1],
    },
    eventCellStyle: {
      borderColor: palettes.gray['400'],
      borderWidth: StyleSheet.hairlineWidth,
    },
    event: {
      backgroundColor: undefined,
      shadowColor: undefined,
      shadowOffset: undefined,
      shadowOpacity: undefined,
      shadowRadius: undefined,
      elevation: undefined,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: palettes.gray['400'],
      borderWidth: StyleSheet.hairlineWidth,
    },
    dayHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loader: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: 999,
    },
  });
