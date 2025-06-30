import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import {
  faCalendarAlt,
  faList,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { Col } from '@lib/ui/components/Col';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { CalendarHeader } from '@lib/ui/components/calendar/CalendarHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { faSeat } from '@lib/ui/icons/faSeat';
import { WeekNum } from '@lib/ui/types/Calendar';
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
  canBeBookedWithSeatSelection,
  getBookingSlotStatus,
  getBookingStyle,
  getCalendarHours,
  getCalendarPropsFromTopic,
  isPastSlot,
} from '../../../utils/bookings';
import {
  formatDate,
  isCurrentMonth,
  isCurrentYear,
} from '../../../utils/dates';
import { WeekFilter } from '../../agenda/components/WeekFilter';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { BookingSlotModal } from '../components/BookingSlotModal';
import { BookingSlotsStatusLegend } from '../components/BookingSlotsStatusLegend';

const START_DATE = DateTime.now().startOf('day');

type Props = NativeStackScreenProps<ServiceStackParamList, 'BookingSlot'>;
export type BookingCalendarEvent = BookingSlot & {
  start: DateTime;
  end: DateTime;
  duration: number;
  title: string;
};

export const BookingSlotScreen = ({ route, navigation }: Props) => {
  const { topicId } = route.params;
  const { palettes, colors, dark } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const isOffline = useOfflineDisabled();
  const { language } = usePreferencesContext();

  const [showAgenda, setShowAgenda] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    START_DATE.startOf('week'),
  );

  const {
    open: showBottomModal,
    modal: bottomModal,
    close: closeBottomModal,
  } = useBottomModal();
  const { data: myBookings } = useGetBookings();
  const { data: topics } = useGetBookingTopics();
  const {
    data: bookingSlots,
    isLoading,
    isFetching,
    refetch,
    isRefetching,
  } = useGetBookingSlots(topicId, currentWeekStart);
  // props topic
  const currentTopic = useMemo(
    () => getCalendarPropsFromTopic(topics, topicId),
    [topics, topicId],
  );

  // calendario -> eventi
  const calendarEvents = useMemo<BookingCalendarEvent[]>(() => {
    if (!bookingSlots) return [];
    return bookingSlots.map(slot => {
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
        duration: end.diff(start, 'minutes').minutes,
        title: slot.description || '',
      };
    });
  }, [bookingSlots]);

  // funzione comune onPress
  const handlePress = useCallback(
    (evtOrItem: BookingCalendarEvent) => {
      const booking = myBookings?.find(b => b.id === evtOrItem.id);
      const evt: any = 'slot' in evtOrItem ? evtOrItem.slot : evtOrItem;
      if (isPastSlot(evt)) return;
      if (evt.isBooked) {
        if (booking?.seat?.id) {
          navigation.navigate('BookingSeat', {
            bookingId: booking.id,
            slotId: String(booking.id),
            seatId: booking.seat.id,
            topicId: booking.subtopic?.id || booking.topic.id,
          });
          return;
        } else if (booking) {
          navigation.navigate('Booking', { id: booking.id });
          return;
        }
      }
      if (!evt.isBooked && canBeBookedWithSeatSelection(evt)) {
        navigation.navigate('BookingSeatSelection', {
          slotId: String(evt.id),
          startHour: evt.start.toFormat('HH:mm'),
          endHour: evt.end.toFormat('HH:mm'),
          day: evt.start.toFormat('d MMMM'),
          hasSeatSelection: evt.hasSeatSelection,
          topicId,
        });
        return;
      }
      showBottomModal(
        <BookingSlotModal
          topicId={topicId}
          item={evt}
          close={closeBottomModal}
        />,
      );
    },
    [myBookings, navigation, showBottomModal, topicId, closeBottomModal],
  );

  const [, setDates] = useState<DateTime[]>([START_DATE]);
  const loadMore = () =>
    setDates(d => [...d, d[d.length - 1].plus({ days: 1 })]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon={faRedo}
            color={palettes.primary['500']}
            onPress={() => refetch}
          />
          <IconButton
            icon={showAgenda ? faCalendarAlt : faList}
            color={palettes.primary['500']}
            onPress={() => setShowAgenda(v => !v)}
          />
        </>
      ),
    });
  }, [navigation, palettes, refetch, showAgenda]);

  const hours = useMemo(
    () =>
      getCalendarHours(
        currentTopic?.startHour ?? 8,
        currentTopic?.endHour ?? 20,
      ),
    [currentTopic],
  );
  type WeekSection = {
    title: string;
    data: BookingCalendarEvent[];
  };
  const weekSections = useMemo<WeekSection[]>(() => {
    const map = new Map<string, BookingCalendarEvent[]>();

    calendarEvents.forEach(evt => {
      const weekStartISO = evt.start.startOf('week').toISODate()!;
      if (!map.has(weekStartISO)) {
        map.set(weekStartISO, []);
      }
      map.get(weekStartISO)!.push(evt);
    });

    return Array.from(map.entries()).map(([isoStart, evts]) => {
      const start = DateTime.fromISO(isoStart);
      const end = start.plus({ days: 6 });
      const sorted = evts.sort(
        (a, b) => a.start.toMillis() - b.start.toMillis(),
      );
      return {
        title: `${start.toFormat('d LLL')} - ${end.toFormat('d LLL')}`,
        data: sorted,
      };
    });
  }, [calendarEvents]);

  return (
    <>
      <BottomModal dismissable {...bottomModal} />
      <HeaderAccessory justify="space-between">
        <Tabs>
          <BookingSlotsStatusLegend />
        </Tabs>
        <WeekFilter
          current={currentWeekStart}
          getNext={() =>
            setCurrentWeekStart(w =>
              currentTopic.agendaView
                ? w.plus({ days: 1 })
                : w.plus({ week: 1 }),
            )
          }
          getPrev={() =>
            setCurrentWeekStart(w =>
              currentTopic.agendaView
                ? w.minus({ days: 1 })
                : w.minus({ week: 1 }),
            )
          }
          isNextWeekDisabled={isOffline}
          isPrevWeekDisabled={isOffline}
          daysPerWeek={currentTopic.daysPerWeek! - 1}
        />
      </HeaderAccessory>

      <View style={styles.container} onLayout={() => {}}>
        {(isFetching || isLoading || isRefetching) && (
          <ActivityIndicator size="large" style={styles.loader} />
        )}

        {showAgenda ? (
          <SectionList<BookingCalendarEvent>
            sections={weekSections}
            keyExtractor={item => item.id.toString()}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.weekHeader}>
                <Text variant="heading">{title}</Text>
              </View>
            )}
            renderItem={({ item, index, section }) => {
              // destrutturo la data
              const dt = item.start;
              const weekDay = dt.toFormat('EEE');
              const dayOfMonth = dt.toFormat('d');
              const monthOfYear = !isCurrentMonth(dt)
                ? dt.toFormat('MMM')
                : null;
              const year = !isCurrentYear(dt) ? dt.toFormat('y') : null;

              // controllo se è il primo item di questo giorno
              const isFirstOfDay =
                index === 0 ||
                dt.toISODate() !== section.data[index - 1].start.toISODate();

              // calcolo stile e testo per AgendaCard
              const { backgroundColor: borderColor } = getBookingStyle(
                item,
                palettes,
                colors,
                dark,
              );
              const timeRange =
                item.start.toFormat('HH:mm') +
                ' – ' +
                item.end.toFormat('HH:mm');
              const statusLabel = t(
                getBookingSlotStatus(
                  item,
                  'bookingScreen.bookingStatus.notAvailableBooking',
                ),
              );

              return (
                <Row style={{ marginVertical: 8 }}>
                  {/* Colonna data: mostro solo se è il primo del giorno */}
                  {isFirstOfDay ? (
                    <Col style={styles.dayColumn}>
                      {item.start.hasSame(DateTime.local(), 'day') ? (
                        <View style={[styles.dayBox, styles.todayBox]}>
                          <Text
                            variant="heading"
                            style={[styles.secondaryDay, styles.today]}
                          >
                            {weekDay}
                          </Text>
                          <Text variant="heading" style={styles.today}>
                            {dayOfMonth}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.dayBox}>
                          <Text variant="heading" style={styles.secondaryDay}>
                            {weekDay}
                          </Text>
                          <Text variant="heading">{dayOfMonth}</Text>
                          {monthOfYear && (
                            <Text variant="heading" style={styles.secondaryDay}>
                              {monthOfYear}
                            </Text>
                          )}
                          {year && (
                            <Text variant="heading" style={styles.secondaryDay}>
                              {year}
                            </Text>
                          )}
                        </View>
                      )}
                    </Col>
                  ) : (
                    // placeholder per mantenere l'allineamento
                    <View style={styles.dayColumn} />
                  )}

                  {/* Colonna con la card */}
                  <Col flex={1}>
                    <AgendaCard
                      title={item.title}
                      type={statusLabel}
                      color={borderColor}
                      time={timeRange}
                      onPress={() => handlePress(item)}
                    >
                      <Row align="center" justify="space-between">
                        <Text>
                          {item.bookedPlaces} / {item.places || 0}
                        </Text>
                      </Row>
                    </AgendaCard>
                  </Col>
                </Row>
              );
            }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text>{t('bookingScreen.noSlots')}</Text>
              </View>
            }
          />
        ) : (
          calendarEvents.length > 0 && (
            <Calendar<BookingCalendarEvent>
              weekStartsOn={currentWeekStart.weekday as WeekNum}
              mode={currentTopic.agendaView ? 'day' : 'custom'}
              weekEndsOn={
                currentWeekStart.plus({ days: currentTopic.daysPerWeek! - 1 })
                  .weekday as WeekNum
              }
              headerContentStyle={styles.dayHeader}
              weekDayHeaderHighlightColor={colors.background}
              calendarCellStyle={styles.eventCellStyle}
              date={currentWeekStart}
              locale={language}
              hours={hours}
              bodyContainerStyle={{ backgroundColor: colors.yellow }}
              cellMaxHeight={currentTopic.slotLength || CALENDAR_CELL_HEIGHT}
              showAllDayEventCell={false}
              swipeEnabled={false}
              renderHeader={props => (
                <CalendarHeader {...props} cellHeight={-1} />
              )}
              onPressEvent={handlePress}
              events={calendarEvents}
              height={styles.container.flex as number}
              startHour={currentTopic.startHour || 8}
              renderEvent={(item, touchableOpacityProps, key) => {
                const isMini = item.duration <= 15;
                const { color, backgroundColor } = getBookingStyle(
                  item,
                  palettes,
                  colors,
                  dark,
                );
                const dateStart = formatDate(item.start.toJSDate());
                const timeStart = item.start.toFormat('HH:mm');
                const timeEnd = item.end.toFormat('HH:mm');
                const timeMessage = ` ${dateStart}, ${t('common.fromTime')} ${timeStart}, ${t('common.toTime')} ${timeEnd}`;
                return (
                  <Pressable
                    key={key}
                    {...touchableOpacityProps}
                    style={[
                      touchableOpacityProps.style,
                      styles.event,
                      { backgroundColor },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      t(
                        getBookingSlotStatus(
                          item,
                          'bookingScreen.bookingStatus.notAvailableBooking',
                        ),
                      ) + timeMessage
                    }
                    onPress={() => handlePress(item)}
                  >
                    {!isMini && <Icon icon={faSeat} color={color} />}
                    <Text style={styles.placesText}>
                      {item.bookedPlaces} / {item.places || 0}
                    </Text>
                  </Pressable>
                );
              }}
            />
          )
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
  shapes,
}: any) =>
  StyleSheet.create({
    container: { flex: 1, width: '100%' },
    loader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
    eventCellStyle: {
      borderColor: palettes.gray['400'],
      borderWidth: StyleSheet.hairlineWidth,
    },
    event: {
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: palettes.gray['400'],
      borderWidth: StyleSheet.hairlineWidth,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placesText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      marginTop: spacing[1],
    },
    dayColumn: {
      width: '15%',
      maxWidth: 200,
    },
    secondaryDay: {
      textTransform: 'capitalize',
      fontWeight: fontWeights.medium,
    },
    dayBox: {
      display: 'flex',
      alignItems: 'center',
      paddingVertical: spacing[2],
    },
    todayBox: {
      display: 'flex',
      backgroundColor: colors.heading,
      borderRadius: shapes.lg,
      marginLeft: spacing[1],
      marginRight: spacing[2],
      marginTop: spacing[2],
    },
    today: {
      color: colors.surface,
    },
    weekHeader: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
    },
    empty: {
      padding: spacing[4],
      alignItems: 'center',
    },
  });
