import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import useStateRef from 'react-usestateref';

import {
  faCalendarDay,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { IconButton } from '@lib/ui/components/IconButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { BOOKINGS_QUERY_KEY } from '../../../core/queries/bookingHooks';
import { EXAMS_QUERY_KEY } from '../../../core/queries/examHooks';
import { DEADLINES_QUERY_KEY } from '../../../core/queries/studentHooks';
import { prefixKey, prefixKeys } from '../../../utils/queries';
import { AgendaStackParamList } from '../components/AgendaNavigator';
import { AgendaTabs } from '../components/AgendaTabs';
import { WeeklyAgenda } from '../components/WeeklyAgenda';
import { AGENDA_QUERY_KEY, useGetAgendaWeeks } from '../queries/agendaHooks';
import { LECTURES_QUERY_KEY } from '../queries/lectureHooks';
import { AgendaFiltersState } from '../types/AgendaFiltersState';
import { AgendaItemTypes } from '../types/AgendaItem';
import { AgendaState } from '../types/AgendaState';
import { AgendaWeek } from '../types/AgendaWeek';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Agenda'>;

export const AgendaScreen = ({ navigation }: Props) => {
  const { palettes, fontSizes } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { courses: coursesPreferences } = usePreferencesContext();
  const client = useQueryClient();

  const [filters, setFilters] = useState<AgendaFiltersState>({
    booking: true,
    deadline: true,
    exam: true,
    lecture: true,
  });

  const toggleFilter = (type: AgendaItemTypes) =>
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));

  const refreshQueries = () => {
    setAgendaState(prev => ({ ...prev, isRefreshing: true }));
    Promise.all(dependingQueryKeys.map(q => client.invalidateQueries(q)))
      .then(_ => client.invalidateQueries(agendaQueryKey))
      .then(_ => setAgendaState(prev => ({ ...prev, isRefreshing: false })));
  };

  const { data, fetchNextPage, isFetchingNextPage, isFetchingPreviousPage } =
    useGetAgendaWeeks(coursesPreferences, filters);

  const flatListRef = useRef<FlatList<AgendaWeek>>(null);

  const prevPageThreshold = 300;

  const screenOptions = [
    {
      id: 'refresh',
      title: t('agendaScreen.refresh'),
    },
  ];

  const dependingQueryKeys = prefixKeys([
    [EXAMS_QUERY_KEY],
    [BOOKINGS_QUERY_KEY],
    [LECTURES_QUERY_KEY],
    [DEADLINES_QUERY_KEY],
  ]);

  const agendaQueryKey = prefixKey([AGENDA_QUERY_KEY]);

  const [agendaState, setAgendaState, agendaStateRef] =
    useStateRef<AgendaState>({
      contentHeight: 0, // the total height of scrollview content
      currentOffset: 0, // current scrollview offset
      isRefreshing: false, // is refreshing all agenda data
      shouldLoadNext: false, // should retrieve the previous page of data
      shouldLoadPrevious: true, // should retrieve the next page of data
      todayOffsetInWeek: 0, // the offset of today inside its week
      todayOffsetOverall: 0, // the offset of today, based on contentHeight
    });

  const setTodayOffset = (offsetY: number) => {
    setAgendaState(prev => ({
      ...prev,
      todayOffsetInWeek: offsetY,
      todayOffsetOverall: prev.contentHeight + offsetY,
    }));
  };

  const scrollToToday = (isAnimated = false) => {
    agendaStateRef.current.todayOffsetOverall > 0 &&
      flatListRef.current?.scrollToOffset({
        offset: agendaStateRef.current.todayOffsetOverall,
        animated: isAnimated,
      });
  };

  const scrollToLastOffset = () => {
    flatListRef.current?.scrollToOffset({
      offset: agendaState.currentOffset,
      animated: false,
    });
  };

  const onContentHeightChange = (height: number) => {
    setAgendaState(prev => ({
      ...prev,
      contentHeight: height,
      todayOffsetOverall:
        prev.todayOffsetOverall + (height - prev.contentHeight),
    }));
  };

  // Handle asynchronous retrieval of previous/next page
  useEffect(() => {
    if (!agendaState || !data) return;
    if (agendaState.shouldLoadPrevious) {
      // fetchPreviousPage({ cancelRefetch: false }).then(() => {
      //     console.debug(`Fetched prev`);
      //     // sectionListRef.current.getScrollResponder().scrollTo({ y: agendaState.currentOffset, animated: false });
      //     setAgendaState(prev => ({
      //       ...prev,
      //       shouldLoadPrevious: false
      //     }));
      //   }
      // );
    }
    if (agendaState.shouldLoadNext) {
      fetchNextPage({ cancelRefetch: false }).then(() =>
        setAgendaState(prev => ({ ...prev, shouldLoadNext: false })),
      );
    }
  }, [data, agendaState, fetchNextPage, setAgendaState]);

  useLayoutEffect(() => {
    const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
      if (event === 'refresh') {
        refreshQueries();
      }
    };

    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon={faCalendarDay}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="left"
            accessibilityLabel={t('agendaScreen.backToToday')}
            onPress={() => scrollToToday(true)}
          />
          <MenuView actions={screenOptions} onPressAction={onPressOption}>
            <IconButton
              icon={faEllipsisVertical}
              color={palettes.primary[400]}
              size={fontSizes.lg}
              adjustSpacing="right"
              accessibilityLabel={t('common.options')}
            />
          </MenuView>
        </>
      ),
    });
  }, [
    colors.primary,
    fontSizes.lg,
    navigation,
    screenOptions,
    scrollToToday,
    t,
  ]);

  return (
    <View style={styles.container}>
      <AgendaTabs state={filters} toggleState={toggleFilter} />
      {!data || agendaState.isRefreshing ? (
        <ActivityIndicator style={styles.activityIndicator} size="large" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={data?.pages ?? []}
          initialNumToRender={1}
          keyExtractor={item => item.key}
          extraData={[isFetchingPreviousPage, isFetchingNextPage]}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <WeeklyAgenda agendaWeek={item} setTodayOffset={setTodayOffset} />
          )}
          ListHeaderComponent={
            isFetchingPreviousPage ? (
              <ActivityIndicator size="small" />
            ) : undefined
          }
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator size="small" /> : undefined
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEventThrottle={100}
          // onContentSizeChange={(contentWidth, contentHeight) => onContentHeightChange(contentHeight)}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            setAgendaState(prev => {
              return {
                ...prev,
                shouldLoadPrevious:
                  prev.shouldLoadPrevious || offsetY < prevPageThreshold,
                currentOffset: offsetY,
              };
            });
          }}
          onEndReachedThreshold={0.3}
          onEndReached={() =>
            setAgendaState(prev => ({
              ...prev,
              shouldLoadNext: true,
            }))
          }
          onLayout={() => scrollToToday()}
        />
      )}
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    activityIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    separator: {
      height: spacing[8],
    },
    container: { flex: 1 },
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
