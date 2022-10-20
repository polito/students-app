import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View, ViewToken } from 'react-native';

import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { DateTime } from 'luxon';

import { mapAgendaItem } from '../../../core/agenda';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetLectures } from '../../../core/queries/lectureHooks';
import { AgendaDayInterface } from '../../../utils/types';
import { AgendaDay } from '../components/AgendaDay';
import { DrawerCalendar } from '../components/DrawerCalendar';

const viewabilityConfig = {
  // minimumViewTime: 100,
  viewAreaCoveragePercentThreshold: 30,
  waitForInteraction: false,
};

export const AgendaScreen = () => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const examsQuery = useGetExams();
  const bookingsQuery = useGetBookings();
  const lecturesQuery = useGetLectures();
  const [viewedDate, setViewedDate] = useState<string>('');
  const flatListRef = useRef();

  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const [selectedEventTypes, setSelectedEventTypes] = useState<
    Record<string, boolean>
  >({
    lectures: false,
    exams: false,
    bookings: false,
    deadlines: false,
  });

  const agendaDays = useMemo(() => {
    return mapAgendaItem(
      examsQuery.data?.data || [],
      bookingsQuery.data?.data || [],
      lecturesQuery.data?.data || [],
      colors,
    );
  }, [examsQuery.data, bookingsQuery.data, lecturesQuery.data]);

  const onSelectTab = (tabName: string) => {
    setSelectedEventTypes(types => ({
      ...types,
      [tabName]: !types[tabName],
    }));
  };

  const onViewableItemsChanged = (changed: {
    viewableItems: Array<ViewToken>;
    changed: Array<ViewToken>;
  }) => {
    // console.log({ changed });
    console.log({ viewableItems: changed.viewableItems });
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
      console.log({ agendaDayIndex });
      if (agendaDayIndex >= 0 && flatListRef && flatListRef.current) {
        try {
          // @ts-ignore
          flatListRef.current.scrollToIndex({
            animated: true,
            index: agendaDayIndex,
          });
        } catch (e) {
          console.log({ e });
        }
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
          selected={selectedEventTypes.lectures}
          onPress={() => onSelectTab('lectures')}
        >
          {t('Lectures')}
        </Tab>
        <Tab
          selected={selectedEventTypes.exams}
          onPress={() => onSelectTab('exams')}
        >
          {t('Exams')}
        </Tab>
        <Tab
          selected={selectedEventTypes.bookings}
          onPress={() => onSelectTab('bookings')}
        >
          {t('Bookings')}
        </Tab>
        <Tab
          selected={selectedEventTypes.deadlines}
          onPress={() => onSelectTab('deadlines')}
        >
          {t('Deadlines')}
        </Tab>
      </Tabs>
      <FlatList
        ref={flatListRef}
        style={styles.list}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        contentContainerStyle={[styles.listContainer, bottomBarAwareStyles]}
        data={agendaDays}
        ItemSeparatorComponent={() => <View style={{ height: spacing[5] }} />}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <DrawerCalendar onPressDay={onPressCalendarDay} viewedDate={viewedDate} />
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
    list: { flex: 1 },
    listContainer: {
      padding: spacing[5],
      paddingTop: 100,
    },
  });
