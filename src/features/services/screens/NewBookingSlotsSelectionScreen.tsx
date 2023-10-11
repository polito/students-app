import { useCallback, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { WeekFilter } from '../../agenda/components/WeekFilter';
import { BookingSlotsStatusLegend } from '../components/BookingSlotsStatusLegend';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'NewBookingSlotsSelection'
>;

const weekStart = DateTime.now().startOf('week');

export const NewBookingSlotsSelectionScreen = ({
  route,
  navigation,
}: Props) => {
  const { topicId } = route.params;
  const { palettes, colors } = useTheme();
  const { t } = useTranslation();
  const isFetching = false;
  const styles = useStylesheet(createStyles);
  const [currentWeekStart, setCurrentWeekStart] = useState(weekStart);
  const [currentPageNumber, setCurrentPageNumber] = useState(0);
  const { language } = usePreferencesContext();

  const nextWeek = useCallback(() => {
    const updatedWeek = currentWeekStart.plus({ days: 7 });
    setCurrentWeekStart(updatedWeek);
  }, [currentPageNumber, currentWeekStart]);

  const prevWeek = useCallback(() => {
    const updatedWeek = currentWeekStart.minus({ days: 7 });
    setCurrentWeekStart(updatedWeek);
  }, [currentWeekStart, currentPageNumber]);

  const prevMissingCallback = useCallback(() => false, []);
  const [calendarHeight, setCalendarHeight] = useState<number | undefined>(
    undefined,
  );
  const nextMissingCallback = useCallback(() => false, []);
  const isOffline = useOfflineDisabled();

  const isPrevWeekDisabled = isOffline ? prevMissingCallback() : isFetching;
  const isNextWeekDisabled = isOffline ? nextMissingCallback() : isFetching;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={faRedo}
          color={palettes.primary['500']}
          adjustSpacing="left"
          onPress={() => {
            const updatedWeek = DateTime.now().startOf('day');
            setCurrentWeekStart(updatedWeek);
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
          isNextWeekDisabled={isNextWeekDisabled}
          isPrevWeekDisabled={isPrevWeekDisabled}
        />
      </HeaderAccessory>
      <View
        style={styles.calendarContainer}
        onLayout={e => setCalendarHeight(e.nativeEvent.layout.height)}
      >
        {calendarHeight && (
          <Calendar
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
            events={[]}
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
    },
    dayHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
