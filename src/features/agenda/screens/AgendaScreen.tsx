import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native';

import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import _, { throttle } from 'lodash';
import { DateTime } from 'luxon';

import { mapAgendaItem } from '../../../core/agenda';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetInfiniteBookings } from '../../../core/queries/bookingHooks';
import { useGetInfiniteExams } from '../../../core/queries/examHooks';
import { useGetInfiniteLectures } from '../../../core/queries/lectureHooks';
import { useGetInfiniteDeadlines } from '../../../core/queries/studentHooks';
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
    const agendaItems = mapAgendaItem(
      _.flatMap(_.get(examsQuery, 'data.pages', []), page => page.data) || [],
      _.flatMap(_.get(bookingsQuery, 'data.pages', []), page => page.data) ||
        [],
      _.flatMap(_.get(lecturesQuery, 'data.pages', []), page => page.data) ||
        [],
      _.flatMap(_.get(deadlinesQuery, 'data.pages', []), page => page.data) ||
        [],
      colors,
    );
    return agendaItems;
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
          {t('courseLecturesTab.title')}
        </Tab>
        <Tab
          selected={selectedEventTypes.exam}
          onPress={() => onSelectTab('exam')}
        >
          {t('examsScreen.title')}
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
          console.log(event.nativeEvent.contentOffset.y);
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
