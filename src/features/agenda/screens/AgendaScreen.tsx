import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { findIndex, flatMap, get, throttle } from 'lodash';
import { DateTime } from 'luxon';

import { filterAgendaItem, mapAgendaItem } from '../../../core/agenda';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetInfiniteBookings } from '../../../core/queries/bookingHooks';
import { useGetInfiniteExams } from '../../../core/queries/examHooks';
import { useGetInfiniteLectures } from '../../../core/queries/lectureHooks';
import { useGetInfiniteDeadlines } from '../../../core/queries/studentHooks';
import { AgendaDayInterface } from '../../../utils/types';
import { AgendaDay } from '../components/AgendaDay';
import { DrawerCalendar } from '../components/DrawerCalendar';
import { AgendaTabs } from './AgendaTabs';

const viewabilityConfig = {
  // minimumViewTime: 100,
  viewAreaCoveragePercentThreshold: 15,
  waitForInteraction: false,
};

export const AgendaScreen = () => {
  const { colors, spacing } = useTheme();
  const { updatePreference } = usePreferencesContext();
  const styles = useStylesheet(createStyles);
  const examsQuery = useGetInfiniteExams();
  const bookingsQuery = useGetInfiniteBookings();
  const lecturesQuery = useGetInfiniteLectures();
  const deadlinesQuery = useGetInfiniteDeadlines();
  const [pageUp, setPageUp] = useState(0);
  const [pageDown, setPageDown] = useState(0);
  const [viewedDate, setViewedDate] = useState<string>(
    DateTime.now().toISODate(),
  );
  const flatListRef = useRef<FlatList>();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const [filters, setFilters] = useState<string[]>([]);

  useEffect(() => {
    updatePreference('types', {
      Lecture: { color: colors.primary[500] },
      Deadline: { color: colors.success[500] },
      Booking: { color: colors.error[400] },
    });
    setTimeout(() => {
      onPressScrollToToday();
    }, 2000);
  }, []);

  useEffect(() => {
    if (pageUp !== 0) {
      getNextData(pageUp);
    }
  }, [pageUp]);

  useEffect(() => {
    if (pageDown !== 0) {
      getNextData(pageDown);
    }
  }, [pageDown]);

  const getNextData = useCallback((newPage: number) => {
    // examsQuery.fetchNextPage({pageParam: newPage})
    // bookingsQuery.fetchNextPage({pageParam: newPage})
    // lecturesQuery.fetchNextPage({pageParam: newPage})
    // deadlinesQuery.fetchNextPage({pageParam: newPage})
  }, []);

  const toFilterAgendaDays = useMemo(() => {
    return mapAgendaItem(
      flatMap(get(examsQuery, 'data.pages', []), page => page.data) || [],
      flatMap(get(bookingsQuery, 'data.pages', []), page => page.data) || [],
      flatMap(get(lecturesQuery, 'data.pages', []), page => page.data) || [],
      flatMap(get(deadlinesQuery, 'data.pages', []), page => page.data) || [],
      colors,
    );
  }, [
    examsQuery.data,
    bookingsQuery.data,
    lecturesQuery.data,
    deadlinesQuery.data,
  ]);

  const agendaDays = useMemo(() => {
    return filterAgendaItem(toFilterAgendaDays, filters);
  }, [toFilterAgendaDays, filters]);

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

  const onEndReached = () => {
    setPageDown(pageDown + 1);
  };

  const onTopReached = useCallback(
    throttle(() => {
      setPageUp(oldPage => oldPage - 1);
    }, 2000),
    [],
  );

  const onPressCalendarDay = useCallback(
    (day: Date) => {
      const formattedDay = DateTime.fromJSDate(day).toISODate();
      const agendaDayIndex = findIndex(
        agendaDays,
        item => item.id === formattedDay,
      );
      console.log('agendaDayIndex', agendaDayIndex);
      try {
        if (flatListRef && flatListRef.current) {
          if (agendaDayIndex >= 0) {
            flatListRef.current.scrollToIndex({
              animated: true,
              index: agendaDayIndex,
            });
          } else {
            const index = searchNearestIndexDate(agendaDays, day);
            if (index === undefined) {
              return;
            }
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

  const onChangeTab = (filterValues: string[]) => {
    setFilters(filterValues);
  };

  return (
    <View style={styles.container}>
      <AgendaTabs onChangeTab={onChangeTab} />
      <FlatList
        // windowSize={12}
        ref={flatListRef}
        style={styles.list}
        removeClippedSubviews
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        contentContainerStyle={[bottomBarAwareStyles, styles.listContainer]}
        data={agendaDays}
        // maxToRenderPerBatch={8}
        // initialNumToRender={8}
        ItemSeparatorComponent={() => <View style={{ height: spacing[5] }} />}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          if (event.nativeEvent.contentOffset.y < 0) {
            onTopReached();
          }
        }}
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

const createStyles = ({ colors, spacing, dark }: Theme) =>
  StyleSheet.create({
    agendaCard: { flex: 1 },
    tabs: {
      backgroundColor: dark ? colors.primary[700] : colors.surface,
      borderBottomWidth: Platform.select({
        ios: StyleSheet.hairlineWidth,
      }),
      borderBottomColor: colors.divider,
      elevation: 3,
      zIndex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: dark ? colors.primary[700] : undefined,
    },
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

  return minDifference === null
    ? undefined
    : differences.findIndex(diff => diff === minDifference);
};
