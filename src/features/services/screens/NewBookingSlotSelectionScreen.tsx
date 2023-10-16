import { useCallback, useLayoutEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { CalendarHeader } from '@lib/ui/components/calendar/CalendarHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetBookingSlots } from '../../../core/queries/bookingHooks';
import { WeekFilter } from '../../agenda/components/WeekFilter';
import { BookingSlotsStatusLegend } from '../components/BookingSlotsStatusLegend';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'NewBookingSlotSelection'
>;

type BookingCalendarEvent = {
  start: DateTime;
  end: DateTime;
  title: string;
  slotId: number;
};

const bookingCalendarEvent: BookingCalendarEvent[] = [
  {
    slotId: 123456,
    start: DateTime.fromObject({
      year: 2023,
      month: 10,
      day: 17,
      hour: 9,
    }),
    end: DateTime.fromObject({
      year: 2023,
      month: 10,
      day: 17,
      hour: 10,
    }),
    title: 'Test',
  },
];

export const NewBookingSlotSelectionScreen = ({ route, navigation }: Props) => {
  const { topicId } = route.params;
  const { palettes, colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const isOffline = useOfflineDisabled();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    DateTime.now().startOf('week'),
  );
  const { isFetching, ...bookingSlotsQuery } = useGetBookingSlots(
    topicId,
    currentWeekStart,
  );

  console.debug('bookingSlotsQuery', bookingSlotsQuery.data);

  const { language } = usePreferencesContext();

  const nextWeek = useCallback(() => {
    setCurrentWeekStart(odlW => odlW.plus({ days: 7 }));
  }, []);

  const prevWeek = useCallback(() => {
    setCurrentWeekStart(odlW => odlW.minus({ days: 7 }));
  }, []);

  const [calendarHeight, setCalendarHeight] = useState<number | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={faRedo}
          color={palettes.primary['500']}
          adjustSpacing="left"
          onPress={() => {
            setCurrentWeekStart(DateTime.now().startOf('week'));
          }}
        />
      ),
    });
  }, [navigation, palettes]);

  return (
    <>
      <HeaderAccessory justify="space-between">
        <Tabs>
          <BookingSlotsStatusLegend />
        </Tabs>
        <WeekFilter
          current={currentWeekStart}
          getNext={nextWeek}
          getPrev={prevWeek}
          isNextWeekDisabled={isOffline || isFetching}
          isPrevWeekDisabled={isOffline || isFetching}
        />
      </HeaderAccessory>
      <View
        style={styles.calendarContainer}
        onLayout={e => setCalendarHeight(e.nativeEvent.layout.height)}
      >
        {calendarHeight && (
          <Calendar<BookingCalendarEvent>
            weekStartsOn={1}
            weekEndsOn={5}
            headerContentStyle={styles.dayHeader}
            weekDayHeaderHighlightColor={colors.background}
            isEventOrderingEnabled={false}
            showAllDayEventCell={false}
            overlapOffset={10000}
            date={currentWeekStart}
            locale={language}
            mode="custom"
            swipeEnabled={false}
            renderHeader={props => (
              <CalendarHeader {...props} cellHeight={-1} />
            )}
            onPressEvent={event => {
              navigation.navigate('NewBookingSeatSelection', {
                slotId: event.slotId,
              });
            }}
            events={bookingCalendarEvent}
            height={calendarHeight}
            renderEvent={(item, touchableOpacityProps) => {
              return (
                <TouchableOpacity
                  {...touchableOpacityProps}
                  style={[touchableOpacityProps.style, styles.event]}
                >
                  <Text>cc</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </>
  );
};

const createStyles = () =>
  StyleSheet.create({
    calendarContainer: {
      height: '100%',
      width: '100%',
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
    },
    dayHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
