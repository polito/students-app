import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import {
  faCalendarDay,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { AgendaStackParamList } from '../components/AgendaNavigator';
import { DailyAgenda } from '../components/DailyAgenda';
import { EmptyWeek } from '../components/EmptyWeek';
import { useGetAgendaWeeks } from '../queries/agendaHooks';
import { AgendaDay } from '../types/AgendaDay';
import { AgendaWeek } from '../types/AgendaWeek';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Agenda'>;

export const AgendaScreen = ({ navigation }: Props) => {
  const { colors, fontSizes } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { courses: coursesPreferences } = usePreferencesContext();

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useGetAgendaWeeks(coursesPreferences);

  const todayRef = useRef<AgendaDay>();
  const sectionListRef = useRef<SectionList<AgendaDay, AgendaWeek>>();

  const scrollToToday = () => {};
  /* sectionListRef.current &&
  todayRef.current &&
  sectionListRef.current.getScrollResponder().scrollTo(todayRef.current.)*/

  /* scrollToLocation({
       animated,
       item: todayRef.current,
     });*/

  /* const [selectedEventTypes, setSelectedEventTypes] = useState<
    Record<AgendaItemTypes, boolean>
  >({
    lecture: false,
    exam: false,
    booking: false,
    deadline: false
  });*/

  /*  const onSelectTab = (tabName: string) => {
      setSelectedEventTypes(types => ({
        ...types,
        [tabName]: !types[tabName],
      }));
    };*/

  /*  const handleLayoutLoaded = () => {
    sectionListRef.current.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 5,
      animated: false
    });
  };*/

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon={faCalendarDay}
            color={colors.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="left"
            // accessibilityLabel={t("common.preferences")}
            onPress={() => scrollToToday()}
          />
          <IconButton
            icon={faEllipsisVertical}
            color={colors.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="right"
            // accessibilityLabel={t("common.preferences")}
          />
        </>
      ),
    });
  }, []);

  return (
    <View style={styles.container}>
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
          selected={true}
          textStyle={{ color: colors.heading }}
          style={{
            borderWidth: 1,
            backgroundColor: 'transparent',
            borderColor: colors.agendaLecture,
          }}
        >
          {t('courseLecturesTab.title')}
        </Tab>
        <Tab
          selected={true}
          textStyle={{ color: colors.heading }}
          style={{
            borderWidth: 1,
            backgroundColor: 'transparent',
            borderColor: colors.agendaExam,
          }}
        >
          {t('examsScreen.title')}
        </Tab>
        <Tab
          selected={true}
          textStyle={{ color: colors.heading }}
          style={{
            borderWidth: 1,
            backgroundColor: 'transparent',
            borderColor: colors.agendaBooking,
          }}
        >
          {t('common.booking_plural')}
        </Tab>
        <Tab
          selected={true}
          textStyle={{ color: colors.heading }}
          style={{
            borderWidth: 1,
            backgroundColor: 'transparent',
            borderColor: colors.agendaDeadline,
          }}
        >
          {t('common.deadline_plural')}
        </Tab>
      </Tabs>
      {data && (
        <SectionList<AgendaDay, AgendaWeek>
          ref={sectionListRef}
          contentContainerStyle={styles.listContainer}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (
              event.nativeEvent.contentOffset.y < 0 &&
              !isFetchingPreviousPage
            ) {
              return fetchPreviousPage({ cancelRefetch: false });
            }
          }}
          onEndReached={() => fetchNextPage({ cancelRefetch: false })}
          onEndReachedThreshold={0.5}
          sections={data?.pages}
          extraData={isFetchingNextPage}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => {
            return (
              <Text
                variant="secondaryText"
                style={styles.weekHeader}
                capitalize
              >
                {section.since.toFormat('d MMM')}
                {' - '}
                {section.until.minus(1).toFormat('d MMM')}
              </Text>
            );
          }}
          renderItem={({ item, section }) => {
            return (
              <DailyAgenda
                agendaDay={item}
                isEmptyWeek={!!section.data.length}
              />
            );
          }}
          renderSectionFooter={({ section }) =>
            !section.data.length && (
              <Row>
                <Col noFlex style={styles.dayColumn}></Col>
                <Col style={styles.itemsColumn}>
                  <EmptyWeek />
                </Col>
              </Row>
            )
          }
          ListHeaderComponent={
            isFetchingPreviousPage && <ActivityIndicator size="small" />
          }
          ListFooterComponent={
            isFetchingNextPage && <ActivityIndicator size="small" />
          }
          // onLayout={handleLayoutLoaded} TODO HANDLE INITIAL SCROLL
        />
      )}
    </View>
  );
};

const createStyles = ({ colors, spacing, dark }: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
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
    list: {
      flex: 1,
    },
    listContainer: {
      paddingLeft: spacing[1],
      paddingRight: spacing[3],
      paddingVertical: spacing[5],
    },
    weekHeader: {
      marginLeft: '15%',
      paddingTop: spacing[4],
      paddingBottom: spacing[2],
    },
    dayColumn: {
      width: '15%',
      maxWidth: 200,
    },
    itemsColumn: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  });
