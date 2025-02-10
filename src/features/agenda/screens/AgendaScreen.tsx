import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View, ViewToken } from 'react-native';
import DatePicker from 'react-native-date-picker';
import useStateRef from 'react-usestateref';

import {
  faCalendarDay,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { DateTime, IANAZone } from 'luxon';

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
import { AgendaOption } from '../types/AgendaOption';
import { AgendaState } from '../types/AgendaState';
import { AgendaWeek } from '../types/AgendaWeek';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Agenda'>;

export const AgendaScreen = ({ navigation, route }: Props) => {
  const { palettes, fontSizes } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { updatePreference, agendaScreen } = usePreferencesContext();
  const client = useQueryClient();
  const { marginHorizontal } = useSafeAreaSpacing();
  const { language } = usePreferencesContext();
  const { params } = route;
  const today = useMemo(() => new Date(), []);

  const selectedDate = params?.date ?? DateTime.now();

  const [nextDate, setNextDate, nextDateRef] =
    useStateRef<DateTime>(selectedDate);

  const [weeks, setWeeks] = useState<DateTime[]>([
    selectedDate.startOf('week'),
  ]);

  const { isLoading, data } = useGetAgendaWeeks(weeks);

  const [dataPickerIsOpened, setDataPickerIsOpened] = useState<boolean>(false);

  const [isScrolling, setIsScrolling] = useState<boolean>(false);

  const viewabilityConfig = useRef({
    minimumViewTime: 10,
    viewAreaCoveragePercentThreshold: 95,
  }).current;

  const flatListRef = useRef<FlatList<AgendaWeek>>(null);

  const isOffline = useOfflineDisabled();

  const [agendaState, setAgendaState, agendaStateRef] =
    useStateRef<AgendaState>({
      contentHeight: 0, // the total height of scrollview content
      currentOffset: 0, // current scrollview offset
      isRefreshing: false, // is refreshing all agenda data
      shouldLoadNext: false, // should retrieve the previous page of data
      shouldLoadPrevious: true, // should retrieve the next page of data
      dayOffsetInWeek: 0, // the offset of day inside its week
      dayOffsetOverall: 0, // the offset of day, based on contentHeight
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

  const setCurrentDayOffset = (offsetY: number) => {
    setAgendaState(prev => ({
      ...prev,
      dayOffsetInWeek: offsetY,
      dayOffsetOverall: prev.contentHeight + offsetY,
    }));
    setIsScrolling(true);
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (!viewableItems.length) return;
      const startDate = (viewableItems[0].item as AgendaWeek).dateRange.start;
      if (startDate === null) return;
      if (startDate.startOf('week').equals(nextDateRef.current.startOf('week')))
        return;
      setNextDate(startDate);
    },
    [nextDateRef, setNextDate],
  );

  const getSelectedWeek = useCallback(
    (newJSDate: Date) => {
      setDataPickerIsOpened(false);
      const newDate = DateTime.fromJSDate(newJSDate, {
        zone: IANAZone.create('Europe/Rome'),
      });
      (
        navigation as NativeStackNavigationProp<AgendaStackParamList, 'Agenda'>
      ).replace('Agenda', {
        date: newDate,
        animated: false,
      });
    },
    [navigation],
  );

  const scrollToSelectedDay = useCallback(() => {
    agendaStateRef.current.dayOffsetOverall > 0 &&
      flatListRef.current?.scrollToOffset({
        offset: agendaStateRef.current.dayOffsetOverall,
        animated: true,
      });
    setIsScrolling(false);
  }, [agendaStateRef]);

  // const scrollToLastOffset = () => {
  //   flatListRef.current?.scrollToOffset({
  //     offset: agendaState.currentOffset,
  //     animated: false,
  //   });
  // };

  // const onContentHeightChange = (height: number) => {
  //   setAgendaState(prev => ({
  //     ...prev,
  //     contentHeight: height,
  //     todayOffsetOverall: prev.dayOffsetOverall + (height - prev.contentHeight),
  //   }));
  // };

  const screenOptions = useMemo<AgendaOption[]>(
    () => [
      {
        id: 'refresh',
        title: t('agendaScreen.refresh'),
      },
      {
        id: 'weekly',
        title: t('agendaScreen.weeklyLayout'),
      },
    ],
    [t],
  );

  useEffect(() => {
    if (isScrolling) {
      scrollToSelectedDay();
    }
  }, [isScrolling, scrollToSelectedDay]);

  useLayoutEffect(() => {
    const switchToWeekly = () => {
      updatePreference('agendaScreen', {
        ...agendaScreen,
        layout: 'weekly',
      });
      navigation.replace('AgendaWeek', {
        date: nextDate,
      });
    };

    const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
      // eslint-disable-next-line default-case
      switch (event) {
        case 'weekly':
          switchToWeekly();
          break;
        case 'refresh':
          refreshQueries();
          break;
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
            accessibilityLabel={t('agendaScreen.selectDate')}
            onPress={() => setDataPickerIsOpened(true)}
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
    palettes.primary,
    fontSizes.lg,
    navigation,
    t,
    agendaScreen,
    updatePreference,
    refreshQueries,
    nextDate,
    screenOptions,
  ]);

  return (
    <View style={styles.container}>
      <HeaderAccessory>
        <AgendaFilters />
      </HeaderAccessory>
      <DatePicker
        modal
        locale={language}
        date={today}
        mode="date"
        open={dataPickerIsOpened}
        onConfirm={getSelectedWeek}
        onCancel={() => setDataPickerIsOpened(false)}
        title={t('agendaScreen.selectDate')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />
      {!data.length && isOffline && (
        <EmptyState message={t('common.cacheMiss')} />
      )}

      {(!data.length && isLoading) ||
        (agendaState.isRefreshing && (
          <ActivityIndicator style={styles.activityIndicator} size="large" />
        ))}
      {!!data.length && !agendaState.isRefreshing && (
        <FlatList
          ref={flatListRef}
          data={data}
          initialNumToRender={1}
          keyExtractor={item => item.key}
          // extraData={[isFetchingPreviousPage, isFetchingNextPage]}
          contentContainerStyle={[styles.listContainer, marginHorizontal]}
          renderItem={({ item }) => (
            <WeeklyAgenda
              agendaWeek={item}
              setCurrentDayOffset={setCurrentDayOffset}
              currentDay={selectedDate}
            />
          )}
          /* ListHeaderComponent={
            isLoading ? <ActivityIndicator size="small" /> : undefined
          }*/
          ListFooterComponent={
            <>
              {isLoading ? <ActivityIndicator size="small" /> : undefined}
              <BottomBarSpacer />
            </>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEventThrottle={100}
          scrollEnabled={!isScrolling}
          // onContentSizeChange={(contentWidth, contentHeight) => onContentHeightChange(contentHeight)}
          /* onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;

            if (!isLoading && offsetY < prevPageThreshold) {
              setWeeks(prev => {
                const firstWeek = prev[0];

                return [firstWeek.minus({ week: 1 }), ...prev];
              });
            }
          }}*/
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (isLoading) return;
            setWeeks(prev => {
              const lastWeek = prev[prev.length - 1];

              return [...prev, lastWeek.plus({ week: 1 })];
            });
          }}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
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
