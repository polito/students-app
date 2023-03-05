import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { formatDate } from '../../../utils/dates';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Agenda'>;

export const AgendaScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const [selectedEventTypes, setSelectedEventTypes] = useState({
    lectures: false,
    exams: false,
    bookings: false,
    deadlines: false,
  });

  const today = useMemo(() => formatDate(new Date()), []);
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
      <ScrollView style={[{ padding: spacing[5] }]}>
        <EmptyState
          icon={faTriangleExclamation}
          iconColor={colors.orange[600]}
          message={t('common.comingSoon')}
        />
      </ScrollView>
    </View>
  );
};
