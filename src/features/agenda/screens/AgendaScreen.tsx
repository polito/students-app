import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';

export const AgendaScreen = () => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const [selectedEventTypes, setSelectedEventTypes] = useState<{
    [key: string]: boolean;
  }>({
    lectures: false,
    exams: false,
    bookings: false,
    deadlines: false,
  });

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
