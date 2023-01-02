import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Agenda'>;

export const AgendaScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const [selectedEventTypes, setSelectedEventTypes] = useState({
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

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: Platform.select({
            ios: StyleSheet.hairlineWidth,
          }),
          borderBottomColor: colors.divider,
          elevation: 3,
          zIndex: 1,
        }}
      >
        <Tab
          selected={selectedEventTypes.lectures}
          onPress={() =>
            setSelectedEventTypes(types => ({
              ...types,
              lectures: !types.lectures,
            }))
          }
        >
          {t('courseLecturesTab.title')}
        </Tab>
        <Tab
          selected={selectedEventTypes.exams}
          onPress={() =>
            setSelectedEventTypes(types => ({ ...types, exams: !types.exams }))
          }
        >
          {t('examsScreen.title')}
        </Tab>
        <Tab
          selected={selectedEventTypes.bookings}
          onPress={() =>
            setSelectedEventTypes(types => ({
              ...types,
              bookings: !types.bookings,
            }))
          }
        >
          {t('common.booking_plural')}
        </Tab>
        <Tab
          selected={selectedEventTypes.deadlines}
          onPress={() =>
            setSelectedEventTypes(types => ({
              ...types,
              deadlines: !types.deadlines,
            }))
          }
        >
          {t('common.deadline_plural')}
        </Tab>
      </Tabs>
      <FlatList
        style={{ flex: 1 }}
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
              title={item.type}
              subtitle={'Lecture'}
              color={item.type}
              live={false}
              onPress={() => {
                navigation.push('Lecture', { id: null });
              }}
            >
              <Text variant="prose">{item.description}</Text>
            </AgendaCard>
          </View>
        )}
      />
    </View>
  );
};
