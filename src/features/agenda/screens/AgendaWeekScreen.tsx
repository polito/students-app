import { useCallback, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { faCalendarDay, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { CalendarHeader } from '@lib/ui/components/calendar/CalendarHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { HOURS } from '@lib/ui/utils/calendar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { AgendaFilters } from '../components/AgendaFilters';
import { AgendaStackParamList } from '../components/AgendaNavigator';
import { BookingCard } from '../components/BookingCard';
import { DeadlineCard } from '../components/DeadlineCard';
import { ExamCard } from '../components/ExamCard';
import { LectureCard } from '../components/LectureCard';
import { WeekFilter } from '../components/WeekFilter';
import { useGetAgendaWeek } from '../queries/agendaHooks';
import { AgendaItem } from '../types/AgendaItem';

type Props = NativeStackScreenProps<AgendaStackParamList, 'AgendaWeek'>;

export const AgendaWeekScreen = ({ navigation }: Props) => {
  const styles = useStylesheet(createStyles);
  const {
    courses: coursesPreferences,
    updatePreference,
    agendaScreen,
  } = usePreferencesContext();

  const { language } = usePreferencesContext();

  const { t } = useTranslation();
  const { palettes, fontSizes } = useTheme();

  const { colors } = useTheme();

  const [currentWeekStart, setCurrentWeekStart] = useState<DateTime>(
    DateTime.now().startOf('week'),
  );

  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);

  const { data, isFetching /* , fetchPreviousPage, fetchNextPage*/, refetch } =
    useGetAgendaWeek(coursesPreferences);

  const nextWeek = useCallback(() => {
    /*    const updatedWeek = currentWeekStart.plus({ days: 7 });
    setCurrentWeekStart(updatedWeek);

    if (data?.pages[currentPageNumber + 1] !== undefined) {
      setCurrentPageNumber(currentPageNumber + 1);
    } else {
      fetchNextPage({ cancelRefetch: false }).then(() => {
        setCurrentPageNumber(currentPageNumber + 1);
      });
    }*/
  }, [currentPageNumber, currentWeekStart /* , data?.pages, fetchNextPage*/]);

  const prevWeek = useCallback(() => {
    const updatedWeek = currentWeekStart.minus({ days: 7 });
    setCurrentWeekStart(updatedWeek);

    if (currentPageNumber > 0) {
      setCurrentPageNumber(currentPageNumber - 1);
    } else {
      /* fetchPreviousPage({ cancelRefetch: false }).then(() => {
        setCurrentPageNumber(currentPageNumber);
      });*/
    }
  }, [currentWeekStart, currentPageNumber /* , fetchPreviousPage*/]);

  const [calendarHeight, setCalendarHeight] = useState<number | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    const switchToDaily = () => {
      updatePreference('agendaScreen', {
        ...agendaScreen,
        layout: 'daily',
      });
      navigation.replace('Agenda');
    };

    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon={faCalendarDay}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="left"
            accessibilityLabel={t('agendaScreen.backToToday')}
            onPress={switchToDaily}
          />
          <IconButton
            icon={faRefresh}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="right"
            accessibilityLabel={t('agendaScreen.refresh')}
            onPress={() => refetch()}
          />
        </>
      ),
    });
  }, [palettes.primary, fontSizes.lg, navigation, t, agendaScreen]);

  const prevMissingCallback = useCallback(
    () => /* data?.pages[currentPageNumber - 1] === undefined*/ false,
    [/* data?.pages,*/ currentPageNumber],
  );

  const nextMissingCallback = useCallback(
    () => /* data?.pages[currentPageNumber + 1] === undefined*/ false,
    [/* data?.pages, */ currentPageNumber],
  );
  const isOffline = useOfflineDisabled();

  const isPrevWeekDisabled = isOffline ? prevMissingCallback() : isFetching;
  const isNextWeekDisabled = isOffline ? nextMissingCallback() : isFetching;

  return (
    <>
      <HeaderAccessory justify="space-between">
        <AgendaFilters />
        <WeekFilter
          current={currentWeekStart}
          getNext={nextWeek}
          getPrev={prevWeek}
          isNextWeekDisabled={isNextWeekDisabled}
          isPrevWeekDisabled={isPrevWeekDisabled}
        ></WeekFilter>
      </HeaderAccessory>
      <View
        style={styles.calendarContainer}
        onLayout={e => {
          const { height } = e.nativeEvent.layout;
          setCalendarHeight(height);
        }}
      >
        {/*      {!calendarHeight ||
          (isFetching && !data?.pages[currentPageNumber] && (
            <ActivityIndicator size="large" style={styles.loader} />
          ))}*/}
        {calendarHeight && (
          <Calendar<AgendaItem>
            events={(data ?? []) as AgendaItem[]}
            headerContentStyle={styles.dayHeader}
            weekDayHeaderHighlightColor={colors.background}
            date={currentWeekStart}
            mode="custom"
            height={calendarHeight}
            hours={HOURS}
            locale={language}
            startHour={8}
            swipeEnabled={false}
            renderHeader={props => (
              <CalendarHeader {...props} cellHeight={-1} />
            )}
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
    </>
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
    loader: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  });
