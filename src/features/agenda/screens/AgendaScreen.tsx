import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View, ViewToken } from 'react-native';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { useGetExams } from '../../../core/queries/examHooks';

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
  const [viewedData, setViewedData] = useState<string>();

  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const [selectedEventTypes, setSelectedEventTypes] = useState<{
    [key: string]: boolean;
  }>({
    lectures: false,
    exams: false,
    bookings: false,
    deadlines: false,
  });

  const agendaItemsTemp = useMemo(() => {
    console.log({ examsQuery });
    console.log({ bookingsQuery });
  }, [examsQuery.data, bookingsQuery.data]);

  const agendaItems = useMemo(
    () => [
      {
        title: 'Fisica 1',
        live: true,
        type: 'Lesson',
        color: colors.info[500],
        startsAt: new Date(),
        description: 'Event description text test',
      },
      {
        title: 'Fisica 1',
        live: false,
        type: 'Lesson',
        color: colors.info[500],
        startsAt: new Date(),
        description: 'Event description text test',
      },
      {
        title: 'Fisica 1',
        live: false,
        type: 'Lesson',
        color: colors.info[500],
        startsAt: new Date(),
        description: 'Event description text test',
      },
      {
        title: 'Fisica 1',
        live: true,
        type: 'Lesson',
        color: colors.info[500],
        startsAt: new Date(),
        description: 'Event description text test',
      },
      {
        title: 'Fisica 1',
        live: true,
        type: 'Lesson',
        color: colors.info[500],
        startsAt: new Date(),
        description: 'Event description text test',
      },
      {
        title: 'Fisica 1',
        live: true,
        type: 'Lesson',
        color: colors.info[500],
        startsAt: new Date(),
        description: 'Event description text test',
      },
      {
        title: 'Fisica 1',
        live: true,
        type: 'Lesson',
        color: colors.info[500],
        startsAt: new Date(),
        description: 'Event description text test',
      },
    ],
    [colors],
  );

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
    console.log({ changed });
    console.log({ viewableItems: changed.viewableItems });
    if (changed.viewableItems[0]) {
      // const viewedDate = DateTime.fromFormat(changed.viewableItems[0].key, 'dd/MM/yyyy').toISODate() || DateTime.fromJSDate(new Date()).toISODate();
    }
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

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
        style={styles.list}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        contentContainerStyle={[{ padding: spacing[5] }, bottomBarAwareStyles]}
        data={agendaItems}
        ItemSeparatorComponent={() => <View style={{ height: spacing[5] }} />}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '15%' }}>
              {index === 0 && (
                <View>
                  <Text variant="title">LUN</Text>
                  <Text variant="title">18</Text>
                </View>
              )}
            </View>
            <AgendaCard
              style={{ flex: 1 }}
              title={item.title}
              subtitle={item.type}
              color={item.color}
              live={item.live}
            >
              <Text variant="prose">{item.description}</Text>
            </AgendaCard>
          </View>
        )}
      />
    </View>
  );
};

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
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
  });
