import { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Calendar } from 'react-native-big-calendar';

import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
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

  const [currentWeek, setCurrentWeek] = useState<DateTime>(DateTime.now());

  const { data } = useGetAgendaWeeks(
    coursesPreferences,
    filters,
    currentWeek.toJSDate(),
  );

  const nextWeek = useCallback(
    () => setCurrentWeek(p => p.plus({ days: 7 })),
    [setCurrentWeek],
  );
  const prevWeek = useCallback(
    () => setCurrentWeek(p => p.minus({ days: 7 })),
    [setCurrentWeek],
  );

  const toggleFilter = (type: AgendaItemType) =>
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));

  const [weeklyEvents, setWeeklyEvents] = useState<AgendaItem[]>([]);

  useEffect(() => {
    const agendaWeek = data?.pages[0];

    setWeeklyEvents(
      agendaWeek?.data.flatMap(day => {
        return day.items;
      }) ?? [],
    );
  }, [data?.pages]);

  const { height } = useWindowDimensions();

  return (
    <SafeAreaView>
      <Row justify="space-between">
        <AgendaFilters state={filters} toggleState={toggleFilter} />
        <WeekFilter
          current={currentWeek}
          getNext={nextWeek}
          getPrev={prevWeek}
        ></WeekFilter>
      </Row>
      <Calendar<AgendaItem>
        events={weeklyEvents}
        headerContainerStyle={styles.headerContainer}
        mode="custom"
        height={height - 50}
        locale={language}
        swipeEnabled={false}
        headerComponent={null}
        // renderHeader={() => (
        //   <View>
        //     <Text>A</Text>
        //   </View>
        // )}
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
      />
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
    column: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      backgroundColor: 'red',
    },
    event: {
      backgroundColor: undefined,
      padding: 0,
      shadowColor: undefined,
      shadowOffset: undefined,
      shadowOpacity: undefined,
      shadowRadius: undefined,
    },
  });
