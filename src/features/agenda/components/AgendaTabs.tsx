import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { AgendaFiltersState } from '../types/AgendaFiltersState';
import { AgendaItemTypes } from '../types/AgendaItem';

const activeTransparancyLight = '11';
const activeTransparancyDark = '33';

interface Props {
  state: AgendaFiltersState;
  toggleState: (type: AgendaItemTypes) => void;
}

export const AgendaTabs = ({ state, toggleState }: Props) => {
  const { t } = useTranslation();

  const styles = useStylesheet(createStyles);

  return (
    <Tabs style={styles.tabs}>
      <Tab
        selected={state.lecture}
        onPress={() => toggleState('lecture')}
        textStyle={state.lecture ? styles.tabText : styles.tabTextDisabled}
        style={[
          styles.tab,
          state.lecture ? styles.tabLecture : styles.tabDisabled,
        ]}
      >
        {t('courseLecturesTab.title')}
      </Tab>
      <Tab
        selected={state.exam}
        onPress={() => toggleState('exam')}
        textStyle={state.exam ? styles.tabText : styles.tabTextDisabled}
        style={[styles.tab, state.exam ? styles.tabExam : styles.tabDisabled]}
      >
        {t('examsScreen.title')}
      </Tab>
      <Tab
        selected={state.booking}
        onPress={() => toggleState('booking')}
        textStyle={state.booking ? styles.tabText : styles.tabTextDisabled}
        style={[
          styles.tab,
          state.booking ? styles.tabBooking : styles.tabDisabled,
        ]}
      >
        {t('common.booking_plural')}
      </Tab>
      <Tab
        selected={state.deadline}
        onPress={() => toggleState('deadline')}
        textStyle={state.deadline ? styles.tabText : styles.tabTextDisabled}
        style={[
          styles.tab,
          state.deadline ? styles.tabDeadline : styles.tabDisabled,
        ]}
      >
        {t('common.deadline_plural')}
      </Tab>
    </Tabs>
  );
};

const createStyles = ({ colors, palettes, dark }: Theme) =>
  StyleSheet.create({
    tabs: {
      backgroundColor: colors.headersBackground,
      borderBottomWidth: Platform.select({
        ios: StyleSheet.hairlineWidth,
      }),
      borderBottomColor: colors.divider,
      elevation: 3,
      zIndex: 1,
    },
    tab: {
      borderWidth: 1,
    },
    tabText: {
      color: colors.heading,
    },
    tabTextDisabled: {
      color: palettes.text[dark ? 400 : 500],
    },
    tabDisabled: {
      backgroundColor: 'transparent',
      borderColor: palettes.text[dark ? 400 : 500],
    },
    tabBooking: {
      backgroundColor:
        colors.agendaBooking +
        (dark ? activeTransparancyDark : activeTransparancyLight),
      borderColor: colors.agendaBooking,
    },
    tabDeadline: {
      backgroundColor:
        colors.agendaDeadline +
        (dark ? activeTransparancyDark : activeTransparancyLight),
      borderColor: colors.agendaDeadline,
    },
    tabExam: {
      backgroundColor:
        colors.agendaExam +
        (dark ? activeTransparancyDark : activeTransparancyLight),
      borderColor: colors.agendaExam,
    },
    tabLecture: {
      backgroundColor:
        colors.agendaLecture +
        (dark ? activeTransparancyDark : activeTransparancyLight),
      borderColor: colors.agendaLecture,
    },
  });
