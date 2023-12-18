import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

import {
  faCalendarDay,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { CalendarHeader } from '@lib/ui/components/calendar/CalendarHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { HOURS } from '@lib/ui/utils/calendar';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

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
import {
  getAgendaWeekQueryKey,
  useGetAgendaWeek,
} from '../queries/agendaHooks';
import { AgendaItem } from '../types/AgendaItem';
import { AgendaOption } from '../types/AgendaOption';

type Props = NativeStackScreenProps<AgendaStackParamList, 'AgendaWeek'>;

export const AgendaWeekScreen = ({ navigation, route }: Props) => {
  const styles = useStylesheet(createStyles);

  const queryClient = useQueryClient();

  const { updatePreference, agendaScreen } = usePreferencesContext();

  const { language } = usePreferencesContext();

  const { t } = useTranslation();
  const { palettes, fontSizes } = useTheme();

  const { colors } = useTheme();

  const { params } = route;
  const date = params?.date;
  const today = useMemo(() => new Date(), []);

  const [currentWeek, setCurrentWeek] = useState<DateTime>(
    date ? date.startOf('week') : DateTime.now().startOf('week'),
  );

  const [dataPickerIsOpened, setDataPickerIsOpened] = useState<boolean>(false);

  const {
    data: weekData,
    isFetching /* , fetchPreviousPage, fetchNextPage*/,
    refetch,
  } = useGetAgendaWeek(currentWeek);

  const calendarData = useMemo(() => {
    return weekData?.data?.flatMap(week => week.items) ?? [];
  }, [weekData?.data]);

  const getNextWeek = useCallback(() => {
    setCurrentWeek(w => {
      const nextWeek = w.plus({ days: 7 });
      return nextWeek;
    });
  }, []);

  const getPrevWeek = useCallback(() => {
    setCurrentWeek(w => {
      const prevWeek = w.minus({ days: 7 });
      return prevWeek;
    });
  }, []);

  const getSelectedWeek = useCallback((newDate: Date) => {
    setDataPickerIsOpened(false);
    const selectedWeek = DateTime.fromJSDate(newDate).startOf('week');
    setCurrentWeek(selectedWeek);
  }, []);

  const [calendarHeight, setCalendarHeight] = useState<number | undefined>(
    undefined,
  );

  const screenOptions = useMemo<AgendaOption[]>(
    () => [
      {
        id: 'refresh',
        title: t('agendaScreen.refresh'),
      },
      {
        id: 'daily',
        title: t('agendaScreen.dailyLayout'),
      },
    ],
    [],
  );

  useLayoutEffect(() => {
    const switchToDaily = () => {
      updatePreference('agendaScreen', {
        ...agendaScreen,
        layout: 'daily',
      });
      navigation.replace('Agenda', {
        date: currentWeek,
      });
    };

    const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
      // eslint-disable-next-line default-case
      switch (event) {
        case 'daily':
          switchToDaily();
          break;
        case 'refresh':
          refetch();
          break;
      }
    };

    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon={faCalendarDay}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="left"
            accessibilityLabel={t('agendaScreen.selectDate')}
            onPress={() => setDataPickerIsOpened(true)}
          />
          <MenuView actions={screenOptions} onPressAction={onPressOption}>
            <IconButton
              icon={faEllipsisVertical}
              color={palettes.primary[400]}
              size={fontSizes.lg}
              adjustSpacing="right"
              accessibilityLabel={t('common.options')}
            />
          </MenuView>
        </>
      ),
    });
  }, [
    palettes.primary,
    fontSizes.lg,
    navigation,
    t,
    agendaScreen,
    currentWeek,
  ]);

  const isPrevMissing = useCallback(
    () =>
      queryClient.getQueryData(
        getAgendaWeekQueryKey(
          agendaScreen.filters,
          currentWeek.minus({ week: 1 }),
        ),
      ) === undefined,
    [agendaScreen.filters, currentWeek, queryClient],
  );

  const isNextMissing = useCallback(
    () =>
      queryClient.getQueryData(
        getAgendaWeekQueryKey(
          agendaScreen.filters,
          currentWeek.plus({ week: 1 }),
        ),
      ) === undefined,
    [agendaScreen.filters, currentWeek, queryClient],
  );

  const isPrevWeekDisabled = useOfflineDisabled(isPrevMissing);
  const isNextWeekDisabled = useOfflineDisabled(isNextMissing);

  return (
    <>
      <HeaderAccessory justify="space-between">
        <AgendaFilters />
        <WeekFilter
          current={currentWeek}
          getNext={getNextWeek}
          getPrev={getPrevWeek}
          isNextWeekDisabled={isNextWeekDisabled}
          isPrevWeekDisabled={isPrevWeekDisabled}
        ></WeekFilter>
      </HeaderAccessory>
      <DatePicker
        modal
        locale={language}
        date={today}
        mode="date"
        open={dataPickerIsOpened}
        onConfirm={getSelectedWeek}
        onCancel={() => setDataPickerIsOpened(false)}
        title={t('agendaScreen.selectDate')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />
      <View
        style={styles.calendarContainer}
        onLayout={e => {
          const { height } = e.nativeEvent.layout;
          setCalendarHeight(height);
        }}
      >
        {!calendarHeight ||
          (isFetching && (
            <ActivityIndicator size="large" style={styles.loader} />
          ))}
        {calendarHeight && (
          <Calendar<AgendaItem>
            events={calendarData}
            headerContentStyle={styles.dayHeader}
            weekDayHeaderHighlightColor={colors.background}
            date={currentWeek}
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
