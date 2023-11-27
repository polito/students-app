import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import useStateRef from 'react-usestateref';

import { faCalendarWeek, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { DateTime } from 'luxon';

import { BidirectionalFlatList } from '../../../core/components/BidirectionalFlatList';
import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { BOOKINGS_QUERY_KEY } from '../../../core/queries/bookingHooks';
import { EXAMS_QUERY_KEY } from '../../../core/queries/examHooks';
import { DEADLINES_QUERY_PREFIX } from '../../../core/queries/studentHooks';
import { AgendaFilters } from '../components/AgendaFilters';
import { AgendaStackParamList } from '../components/AgendaNavigator';
import { WeeklyAgenda } from '../components/WeeklyAgenda';
import { AGENDA_QUERY_PREFIX, useGetAgendaWeeks } from '../queries/agendaHooks';
import { LECTURES_QUERY_PREFIX } from '../queries/lectureHooks';
import { AgendaState } from '../types/AgendaState';
import { AgendaWeek } from '../types/AgendaWeek';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Agenda'>;

export const AgendaScreen = ({ navigation }: Props) => {
  const { palettes, fontSizes } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { updatePreference, agendaScreen } = usePreferencesContext();
  const client = useQueryClient();
  const { marginHorizontal } = useSafeAreaSpacing();

  const [weeks, setWeeks] = useState<DateTime[]>([
    DateTime.now().startOf('week'),
  ]);

  const onWeekLoaded = useRef<(value: void | PromiseLike<void>) => void>();

  useEffect(() => {
    if (!onWeekLoaded.current) return;
    onWeekLoaded?.current!();
    onWeekLoaded.current = undefined;
  }, [weeks]);

  const { isLoading, data } = useGetAgendaWeeks(weeks);

  const flatListRef = useRef<FlatList<AgendaWeek>>(null);

  const isOffline = useOfflineDisabled();

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

  const refreshQueries = useCallback(() => {
    const dependingQueryKeys = [
      EXAMS_QUERY_KEY,
      BOOKINGS_QUERY_KEY,
      [LECTURES_QUERY_PREFIX],
      [DEADLINES_QUERY_PREFIX],
    ];

    setAgendaState(prev => ({ ...prev, isRefreshing: true }));
    Promise.all(dependingQueryKeys.map(q => client.invalidateQueries(q)))
      .then(_ => client.invalidateQueries([AGENDA_QUERY_PREFIX]))
      .then(_ => setAgendaState(prev => ({ ...prev, isRefreshing: false })));
  }, [client, setAgendaState]);

  const setTodayOffset = (offsetY: number) => {
    setAgendaState(prev => ({
      ...prev,
      todayOffsetInWeek: offsetY,
      todayOffsetOverall: prev.contentHeight + offsetY,
    }));
  };

  const scrollToToday = useCallback(
    (isAnimated = false) => {
      console.debug('ScrollToToday');
      agendaStateRef.current.todayOffsetOverall > 0 &&
        flatListRef.current?.scrollToOffset({
          offset: agendaStateRef.current.todayOffsetOverall,
          animated: isAnimated,
        });
    },
    [agendaStateRef],
  );

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

  useLayoutEffect(() => {
    const switchToWeekly = () => {
      updatePreference('agendaScreen', {
        ...agendaScreen,
        layout: 'weekly',
      });
      navigation.replace('AgendaWeek');
    };

    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon={faCalendarWeek}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="left"
            accessibilityLabel={t('agendaScreen.backToToday')}
            onPress={switchToWeekly}
          />
          <IconButton
            icon={faRefresh}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="right"
            accessibilityLabel={t('agendaScreen.refresh')}
            onPress={() => refreshQueries()}
          />
        </>
      ),
    });
  }, [
    palettes.primary,
    fontSizes.lg,
    navigation,
    scrollToToday,
    t,
    agendaScreen,
    updatePreference,
    refreshQueries,
  ]);

  return (
    <View style={styles.container}>
      <HeaderAccessory>
        <AgendaFilters />
      </HeaderAccessory>
      {!data.length && isOffline && (
        <EmptyState message={t('common.cacheMiss')} />
      )}

      {(!data.length && isLoading) ||
        (agendaState.isRefreshing && (
          <ActivityIndicator style={styles.activityIndicator} size="large" />
        ))}
      {!!data.length && !agendaState.isRefreshing && (
        <BidirectionalFlatList
          ref={flatListRef}
          data={data}
          initialNumToRender={1}
          keyExtractor={item => item.key}
          // extraData={[isFetchingPreviousPage, isFetchingNextPage]}
          contentContainerStyle={[styles.listContainer, marginHorizontal]}
          renderItem={({ item }) => (
            <WeeklyAgenda agendaWeek={item} setTodayOffset={setTodayOffset} />
          )}
          ListHeaderComponent={
            <ActivityIndicator
              size="small"
              style={{ opacity: isLoading ? 1 : 0 }}
            />
          }
          ListFooterComponent={
            <>
              <ActivityIndicator
                size="small"
                style={{ opacity: isLoading ? 1 : 0 }}
              />
              <BottomBarSpacer />
            </>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEventThrottle={100}
          // onContentSizeChange={(contentWidth, contentHeight) => onContentHeightChange(contentHeight)}
          onStartReached={async () => {
            if (onWeekLoaded.current) return;
            setWeeks(prev => {
              const firstWeek = prev[0];

              return [firstWeek.minus({ week: 1 }), ...prev];
            });
            return new Promise(resolve => {
              onWeekLoaded.current = resolve;
            });
          }}
          onEndReached={async () => {
            if (onWeekLoaded.current) return;
            setWeeks(prev => {
              const lastWeek = prev[prev.length - 1];

              return [...prev, lastWeek.plus({ week: 1 })];
            });
            return new Promise(resolve => {
              onWeekLoaded.current = resolve;
            });
          }}
          // onEndReachedThreshold={0.3}
          // onEndReached={() => {
          //   if (isDelayedLoading) return;
          //   console.debug("onEndReachedThreshold'");

          // }}
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
