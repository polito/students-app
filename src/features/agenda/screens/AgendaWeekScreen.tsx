import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Row } from '@lib/ui/components/Row';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { AgendaFilters } from '../components/AgendaFilters';
import { AgendaStackParamList } from '../components/AgendaNavigator';
import { BookingCard } from '../components/BookingCard';
import { DeadlineCard } from '../components/DeadlineCard';
import { ExamCard } from '../components/ExamCard';
import { LectureCard } from '../components/LectureCard';
import { WeekFilter } from '../components/WeekFilter';
import { useGetAgendaWeeks } from '../queries/agendaHooks';
import { AgendaItem, AgendaItemType } from '../types/AgendaItem';
import { AgendaTypesFilterState } from '../types/AgendaTypesFilterState';

type Props = NativeStackScreenProps<AgendaStackParamList, 'AgendaWeek'>;

export const AgendaWeekScreen = ({ navigation }: Props) => {
  const styles = useStylesheet(createStyles);
  const { courses: coursesPreferences } = usePreferencesContext();

  const [filters, setFilters] = useState<AgendaTypesFilterState>({
    booking: false,
    deadline: false,
    exam: false,
    lecture: false,
  });

  const { language } = usePreferencesContext();

  const { colors } = useTheme();

  const [currentWeekStart, setCurrentWeekStart] = useState<DateTime>(
    DateTime.now().startOf('week'),
  );

  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);

  const { data, isFetching, fetchPreviousPage, fetchNextPage } =
    useGetAgendaWeeks(coursesPreferences, filters);

  const nextWeek = useCallback(() => {
    const updatedWeek = currentWeekStart.plus({ days: 7 });
    setCurrentWeekStart(updatedWeek);

    if (data?.pages[currentPageNumber + 1] !== undefined) {
      setCurrentPageNumber(currentPageNumber + 1);
    } else {
      fetchNextPage({ cancelRefetch: false }).then(() => {
        setCurrentPageNumber(currentPageNumber + 1);
      });
    }
  }, [currentPageNumber, currentWeekStart, data?.pages, fetchNextPage]);

  const prevWeek = useCallback(() => {
    const updatedWeek = currentWeekStart.minus({ days: 7 });
    setCurrentWeekStart(updatedWeek);

    if (currentPageNumber > 0) {
      setCurrentPageNumber(currentPageNumber - 1);
    } else {
      fetchPreviousPage({ cancelRefetch: false }).then(() => {
        setCurrentPageNumber(currentPageNumber);
      });
    }
  }, [currentWeekStart, currentPageNumber, fetchPreviousPage]);

  const toggleFilter = (type: AgendaItemType) =>
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));

  const [weeklyEvents, setWeeklyEvents] = useState<AgendaItem[]>([]);

  useEffect(() => {
    const agendaWeek = data?.pages[currentPageNumber];
    setWeeklyEvents(
      agendaWeek?.data.flatMap(day => {
        return day.items;
      }) ?? [],
    );
  }, [data?.pages, currentPageNumber]);

  const [calendarHeight, setCalendarHeight] = useState<number | undefined>(
    undefined,
  );

  return (
    <SafeAreaView>
      <Row justify="space-between">
        <AgendaFilters state={filters} toggleState={toggleFilter} />
        <WeekFilter
          current={currentWeekStart}
          getNext={nextWeek}
          getPrev={prevWeek}
        ></WeekFilter>
      </Row>
      <View
        style={styles.calendarContainer}
        onLayout={e => {
          const { height } = e.nativeEvent.layout;
          setCalendarHeight(height);
        }}
      >
        {!calendarHeight || isFetching ? (
          <ActivityIndicator size="large" />
        ) : (
          <Calendar<AgendaItem>
            events={weeklyEvents}
            headerContentStyle={styles.dayHeader}
            weekDayHeaderHighlightColor={colors.background}
            date={currentWeekStart}
            mode="custom"
            height={calendarHeight}
            locale={language}
            swipeEnabled={false}
            renderEvent={(item: AgendaItem, touchableOpacityProps) => {
              return (
                <TouchableOpacity
                  {...touchableOpacityProps}
                  style={[touchableOpacityProps.style, styles.event]}
                >
                  {item.type === 'booking' && (
                    <BookingCard key={item.key} item={item} compact={true} />
                  )}
                  {item.type === 'deadline' && (
                    <DeadlineCard key={item.key} item={item} compact={true} />
                  )}
                  {item.type === 'exam' && (
                    <ExamCard key={item.key} item={item} compact={true} />
                  )}
                  {item.type === 'lecture' && (
                    <LectureCard key={item.key} item={item} compact={true} />
                  )}
                </TouchableOpacity>
              );
            }}
            weekStartsOn={1}
            weekEndsOn={5}
            isEventOrderingEnabled={false}
            overlapOffset={10000}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    headerContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    container: {
      display: 'flex',
      flexDirection: 'row',
      gap: spacing[2],
    },
    calendarContainer: {
      height: '100%',
      width: '100%',
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      backgroundColor: 'red',
    },
    dayHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    event: {
      backgroundColor: undefined,
      shadowColor: undefined,
      shadowOffset: undefined,
      shadowOpacity: undefined,
      shadowRadius: undefined,
      elevation: undefined,
    },
  });
