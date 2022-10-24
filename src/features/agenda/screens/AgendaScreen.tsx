import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View, ViewToken } from 'react-native';

import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import _ from 'lodash';
import { DateTime } from 'luxon';

import { mapAgendaItem } from '../../../core/agenda';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetLectures } from '../../../core/queries/lectureHooks';
import { useGetDeadlines } from '../../../core/queries/studentHooks';
import { AgendaDayInterface } from '../../../utils/types';
import { AgendaDay } from '../components/AgendaDay';
import { DrawerCalendar } from '../components/DrawerCalendar';

const viewabilityConfig = {
  // minimumViewTime: 100,
  viewAreaCoveragePercentThreshold: 15,
  waitForInteraction: false,
};

export const AgendaScreen = () => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const examsQuery = useGetExams();
  const bookingsQuery = useGetBookings();
  const lecturesQuery = useGetLectures();
  const deadlinesQuery = useGetDeadlines();
  const [viewedDate, setViewedDate] = useState<string>('');
  const flatListRef = useRef();

  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const [selectedEventTypes, setSelectedEventTypes] = useState<
    Record<string, boolean>
  >({
    lecture: false,
    exam: false,
    booking: false,
    deadlines: false,
  });

  const toFilterAgendaDays = useMemo(() => {
    return mapAgendaItem(
      examsQuery.data?.data || [],
      bookingsQuery.data?.data || [],
      lecturesQuery.data?.data || [],
      deadlinesQuery.data?.data || [],
      colors,
    );
  }, [
    examsQuery.data,
    bookingsQuery.data,
    lecturesQuery.data,
    deadlinesQuery.data,
  ]);

  const agendaDays = useMemo(() => {
    const filters = _.chain(selectedEventTypes)
      .map((value, key) => {
        if (value) {
          return key;
        }
      })
      .compact()
      .value();

    if (!filters.length) {
      return toFilterAgendaDays;
    }
    return _.chain(toFilterAgendaDays)
      .map(agendaDay => {
        const agendaDayItems = agendaDay.items.filter(item =>
          filters.includes(item.type.toLowerCase()),
        );
        if (agendaDayItems.length) {
          return {
            ...agendaDay,
            items: agendaDay.items.filter(item =>
              filters.includes(item.type.toLowerCase()),
            ),
          };
        }
      })
      .compact()
      .value();
    // return toFilterAgendaDays.map(agendaDay => {
    //   return {
    //     ...agendaDay,
    //     items: agendaDay.items.filter(item =>
    //       filters.includes(item.type.toLowerCase()),
    //     ),
    //   };
    // });
  }, [toFilterAgendaDays, selectedEventTypes]);

  const onSelectTab = (tabName: string) => {
    setSelectedEventTypes(types => ({
      ...types,
      [tabName]: !types[tabName],
    }));
  };

  const onPressScrollToToday = () => {
    onPressCalendarDay(new Date());
  };

  const onViewableItemsChanged = (changed: {
    viewableItems: Array<ViewToken>;
    changed: Array<ViewToken>;
  }) => {
    // console.log({ viewableItems: changed.viewableItems });
    if (changed.viewableItems[0]) {
      setViewedDate(changed.viewableItems[0].key);
    }
  };

  const onPressCalendarDay = useCallback(
    (day: Date) => {
      const formattedDay = DateTime.fromJSDate(day).toISODate();
      const agendaDayIndex = agendaDays.findIndex(
        item => item.id === formattedDay,
      );
      try {
        if (flatListRef && flatListRef.current) {
          if (agendaDayIndex >= 0) {
            // @ts-ignore
            flatListRef.current.scrollToIndex({
              animated: true,
              index: agendaDayIndex,
            });
          } else {
            const index = searchNearestIndexDate(agendaDays, day);
            if (index === undefined) {
              return;
            }
            // @ts-ignore
            flatListRef.current.scrollToIndex({
              animated: true,
              index: index,
            });
          }
        }
      } catch (e) {
        console.log({ e });
      }
    },
    [agendaDays, flatListRef],
  );

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const renderItem = ({ item }: { item: AgendaDayInterface }) => {
    return <AgendaDay agendaDay={item} />;
  };

  return (
    <View style={styles.container}>
      <Tabs style={styles.tabs}>
        <Tab
          selected={selectedEventTypes.lecture}
          onPress={() => onSelectTab('lecture')}
        >
          {t('Lectures')}
        </Tab>
        <Tab
          selected={selectedEventTypes.exam}
          onPress={() => onSelectTab('exam')}
        >
          {t('Exams')}
        </Tab>
        <Tab
          selected={selectedEventTypes.booking}
          onPress={() => onSelectTab('booking')}
        >
          {t('Bookings')}
        </Tab>
        <Tab
          selected={selectedEventTypes.deadline}
          onPress={() => onSelectTab('deadline')}
        >
          {t('Deadlines')}
        </Tab>
      </Tabs>
      <FlatList
        ref={flatListRef}
        style={styles.list}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        contentContainerStyle={[bottomBarAwareStyles, styles.listContainer]}
        data={agendaDays}
        ItemSeparatorComponent={() => <View style={{ height: spacing[5] }} />}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <DrawerCalendar
        onPressDay={onPressCalendarDay}
        viewedDate={viewedDate}
        agendaDays={agendaDays}
        onPressScrollToToday={onPressScrollToToday}
      />
    </View>
  );
};

const createStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    agendaCard: { flex: 1 },
    tabs: {
      backgroundColor: colors.surface,
      borderBottomWidth: Platform.select({
        ios: StyleSheet.hairlineWidth,
      }),
      borderBottomColor: colors.divider,
      elevation: 3,
      zIndex: 1,
    },
    container: { flex: 1 },
    list: {
      flex: 1,
      paddingTop: 120,
    },
    listContainer: {
      padding: spacing[5],
      paddingBottom: 240,
    },
  });

const searchNearestIndexDate = (
  agendaDays: AgendaDayInterface[],
  date: Date,
) => {
  const luxonDate = DateTime.fromJSDate(date);
  let minDifference: null | number = null;
  const differences = agendaDays.map(agendaDay => {
    const difference = luxonDate.diff(
      DateTime.fromISO(agendaDay.id),
    ).milliseconds;
    if (minDifference === null) {
      minDifference = difference;
    }
    if (difference < minDifference && minDifference > 0) {
      minDifference = difference;
    } else {
      if (difference > minDifference) {
        minDifference = difference;
      }
    }
    return difference;
  });

  console.log('difff', minDifference, differences);
  return minDifference === null
    ? undefined
    : differences.findIndex(diff => diff === minDifference);
};
