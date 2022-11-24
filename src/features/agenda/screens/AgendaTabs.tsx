import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { keys, omitBy } from 'lodash';

interface Props {
  onChangeTab: (filters: string[]) => void;
}

export const AgendaTabs = ({ onChangeTab }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const [selectedEventTypes, setSelectedEventTypes] = useState<
    Record<string, boolean>
  >({
    lecture: false,
    exam: false,
    booking: false,
    deadlines: false,
  });

  useEffect(() => {
    setTimeout(() => {
      onChangeTab(keys(omitBy(selectedEventTypes, type => !type)));
    }, 250);
  }, [selectedEventTypes]);

  const onSelectTab = (tabName: string) => {
    setSelectedEventTypes(types => ({
      ...types,
      [tabName]: !types[tabName],
    }));
  };

  return (
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
        {t('common.booking_plural')}
      </Tab>
      <Tab
        selected={selectedEventTypes.deadline}
        onPress={() => onSelectTab('deadline')}
      >
        {t('common.deadline_plural')}
      </Tab>
    </Tabs>
  );
};

const createStyles = ({ colors, dark }: Theme) =>
  StyleSheet.create({
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
  });
