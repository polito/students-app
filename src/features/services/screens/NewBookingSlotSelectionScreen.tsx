import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { faChair, faRedo } from '@fortawesome/free-solid-svg-icons';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { CalendarHeader } from '@lib/ui/components/calendar/CalendarHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { BookingSlot } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetBookingSlots } from '../../../core/queries/bookingHooks';
import { getBookingStyle } from '../../../utils/bookings';
import { WeekFilter } from '../../agenda/components/WeekFilter';
import { BookingSlotsStatusLegend } from '../components/BookingSlotsStatusLegend';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'NewBookingSlotSelection'
>;

export type BookingCalendarEvent = BookingSlot & {
  start: DateTime;
  end: DateTime;
  title: string;
};

export const NewBookingSlotSelectionScreen = ({ route, navigation }: Props) => {
  const { topicId } = route.params;
  const { palettes, colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const isOffline = useOfflineDisabled();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    DateTime.now().startOf('week'),
  );
  const bookingSlotsQuery = useGetBookingSlots(topicId, currentWeekStart);

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

  const calendarEvents = useMemo(() => {
    if (bookingSlotsQuery.data && bookingSlotsQuery.data.length > 0) {
      return bookingSlotsQuery.data.map(slot => {
        return {
          ...slot,
          start: DateTime.fromJSDate(slot.startsAt as Date),
          end: DateTime.fromJSDate(slot.endsAt as Date),
          title: '',
        };
      });
    }
    return [];
  }, [bookingSlotsQuery.data]);

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
          isNextWeekDisabled={isOffline}
          isPrevWeekDisabled={isOffline}
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
              event.id &&
                navigation.navigate('NewBookingSeatSelection', {
                  slotId: String(event.id),
                  startHour: event.start.toFormat('HH:mm'),
                  endHour: event.end.toFormat('HH:mm'),
                  day: event.start.toFormat('DDDD'),
                  topicId,
                });
            }}
            events={calendarEvents}
            height={calendarHeight}
            renderEvent={(item, touchableOpacityProps) => {
              const { color, backgroundColor } = getBookingStyle(
                item,
                palettes,
              );
              return (
                <TouchableOpacity
                  {...touchableOpacityProps}
                  style={[
                    touchableOpacityProps.style,
                    styles.event,
                    { backgroundColor },
                  ]}
                >
                  <Icon icon={faChair} color={color} />
                  <Text style={[styles.placesText, { color }]}>
                    {item.bookedPlaces} / {item.places}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
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
    placesText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      marginTop: spacing[1],
    },
    notAvailable: {
      backgroundColor: palettes.secondary['100'],
      color: palettes.secondary['700'],
    },
    available: {
      backgroundColor: palettes.primary['100'],
      color: palettes.primary['600'],
    },
    booked: {
      backgroundColor: palettes.green['100'],
      color: palettes.green['600'],
    },
    full: {
      backgroundColor: palettes.danger['100'],
      color: palettes.danger['600'],
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
      borderColor: colors.divider,
      borderWidth: StyleSheet.hairlineWidth,
    },
    dayHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
