import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  faChevronLeft,
  faChevronRight,
  faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PlaceOverview } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';

import { last } from 'lodash';
import { DateTime } from 'luxon';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useGetFreeRooms } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { dateFormatter } from '../../../utils/dates';
import { notNullish } from '../../../utils/predicates';
import { CampusSelector } from '../components/CampusSelector';
import {
  MapNavigationOptions,
  MapScreenProps,
} from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { FREE_ROOMS_TIME_WINDOW_SIZE_HOURS } from '../constants';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { getBottomSheetScreenPadding } from '../utils/getBottomSheetScreenPadding';
import { getCoordinatesBounds } from '../utils/getCoordinatesBounds';

type Props = MapScreenProps<PlacesStackParamList, 'FreeRooms'>;

const slotStartHour = [19, 17, 16, 14, 13, 11, 10, 8];
const initialBottomSheetHeightRatio = 0.3;

const findNearestSlotStartHour = (dt: DateTime) => {
  let maxDate = DateTime.now().plus({ day: 1 }).endOf('day');

  // Skip Sundays
  if (dt.weekday === 7) dt = dt.plus({ day: 1 }).startOf('day');
  if (maxDate.weekday === 7) maxDate = maxDate.plus({ day: 1 }).endOf('day');

  const nearestStartHourIndex = slotStartHour.findIndex(h => h <= dt.hour);
  if (nearestStartHourIndex >= 0 && dt.hour < 20) {
    const nearestStartHour = slotStartHour[nearestStartHourIndex];

    dt = dt.set({
      hour: nearestStartHour,
      minute: nearestStartHourIndex % 2 ? 30 : 0,
    });
  } else {
    if (dt.hour > slotStartHour[0]) {
      // dt.hour > last(slotStartHour)
      // When going forward from a saturday, we need to go forward to the next monday
      dt = dt.plus({ day: dt.weekday === 6 ? 2 : 1 }).set({
        hour: last(slotStartHour),
        minute: 30,
      });
    } else {
      // dt.hour < last(slotStartHour)
      // When going back from a monday, we need to go back to the previous saturday
      dt = dt.minus({ day: dt.weekday === 1 ? 2 : 1 }).set({
        hour: slotStartHour[0],
        minute: 0,
      });
    }
  }

  return dt < maxDate
    ? dt.set({
        second: 0,
        millisecond: 0,
      })
    : maxDate.set({
        hour: slotStartHour[0],
        minute: 0,
        second: 0,
        millisecond: 0,
      });
};

export const FreeRoomsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { spacing, fontSizes } = useTheme();
  const campus = useGetCurrentCampus();
  const { setFeedback, isFeedbackVisible } = useFeedbackContext();
  const [showFeedback, setShowFeedback] = useState(false);
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { floorId, setFloorId } = useContext(PlacesContext);

  const today = useMemo(() => DateTime.now().startOf('day'), []);

  const [startDateTime, setStartDateTime] = useState(
    findNearestSlotStartHour(DateTime.now()),
  );

  const endDateTime = useMemo(
    () =>
      startDateTime.plus({
        hour: FREE_ROOMS_TIME_WINDOW_SIZE_HOURS,
      }),
    [startDateTime],
  );
  const formatHHmm = dateFormatter('HH:mm');
  const printDate = useCallback(
    (dt: DateTime) => {
      const diffInDays = Math.floor(dt.diff(today, 'days').days);

      switch (diffInDays) {
        case 0:
          return t('common.today');
        case 1:
          return t('common.tomorrow');
        case -1:
          return t('common.yesterday');
        default:
          if (diffInDays > 0 && diffInDays < 7) {
            return dt.toFormat('EEEE');
          }
          return dt.toFormat('d/M');
      }
    },
    [t, today],
  );

  useEffect(() => {
    if (
      startDateTime.equals(
        DateTime.now()
          .plus({
            day:
              DateTime.now().plus({ day: 1 }).set({ hour: slotStartHour[0] })
                .weekday === 7
                ? 2
                : 1,
          })
          .set({
            hour: slotStartHour[0],
            minute: 0,
            second: 0,
            millisecond: 0,
          }),
      )
    ) {
      if (showFeedback) {
        setFeedback({
          text: t('freeRoomsScreen.maxViewLimitMessage'),
          isError: true,
          isPersistent: false,
        });
      } else {
        setShowFeedback(true);
      }
    } else {
      setShowFeedback(false);
    }
  }, [startDateTime, t]);

  const { data: sitePlaces } = useSearchPlaces({ siteId: campus?.id });

  const { data: freeRooms, isLoading: isLoadingRooms } = useGetFreeRooms({
    siteId: campus?.id,
    date: startDateTime.toISO()!.split('T')[0],
    timeFrom: startDateTime.toISOTime()!,
    timeTo: endDateTime.toISOTime()!,
  });
  const places = useMemo(
    () =>
      freeRooms?.data
        .map(fr => {
          const place = sitePlaces?.find(p => p.id === fr.id) as PlaceOverview;
          if (!place) return null;
          return { ...fr, ...place };
        })
        ?.filter(notNullish),
    [freeRooms?.data, sitePlaces],
  );
  const displayFloorId = useMemo(() => {
    const floorIds = new Set(freeRooms?.data?.map(r => r.floorId));
    return floorIds.size === 1 ? Array.from(floorIds.values())[0] : undefined;
  }, [freeRooms?.data]);

  useEffect(() => {
    if (!isLoadingRooms && floorId !== displayFloorId) {
      setFloorId(displayFloorId);
    }
  }, [displayFloorId, floorId, isLoadingRooms, setFloorId]);

  useLayoutEffect(() => {
    const mapOptions: Partial<MapNavigationOptions['mapOptions']> = {};
    if (places?.length) {
      mapOptions.camera = {
        bounds: {
          ...getBottomSheetScreenPadding({
            headerHeight,
            tabBarHeight,
            initialBottomSheetHeightRatio,
          }),
          ...getCoordinatesBounds(
            places.map(place => [place.longitude, place.latitude]),
          ),
        },
      };
    }
    navigation.setOptions({
      headerRight: () => <CampusSelector />,
      mapOptions,
      mapContent: () => (
        <MarkersLayer places={places ?? []} displayFloor={!displayFloorId} />
      ),
    });
  }, [displayFloorId, navigation, places]);

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <BottomSheet
        index={1}
        snapPoints={[64, `${initialBottomSheetHeightRatio * 100}%`, '100%']}
        android_keyboardInputMode="adjustResize"
      >
        <Row align="center" gap={2} ph={1}>
          <IconButton
            icon={faChevronLeft}
            color={colors.secondaryText}
            disabled={!freeRooms?.data}
            onPress={() =>
              setStartDateTime(prevDt =>
                findNearestSlotStartHour(prevDt.minus({ hour: 1, minute: 30 })),
              )
            }
          />
          <View
            style={{
              flexGrow: 1,
              height: '100%',
            }}
          >
            <Text
              style={{
                flexGrow: 1,
                textTransform: 'capitalize',
                textAlign: 'center',
                marginVertical: spacing[2],
              }}
            >
              {printDate(startDateTime)} {startDateTime.toFormat('HH:mm')} -{' '}
              {endDateTime.toFormat('HH:mm')}
            </Text>
          </View>
          <IconButton
            icon={faChevronRight}
            color={colors.secondaryText}
            disabled={!freeRooms?.data || isFeedbackVisible}
            onPress={() =>
              setStartDateTime(prevDt =>
                findNearestSlotStartHour(prevDt.plus({ hour: 1, minute: 30 })),
              )
            }
          />
        </Row>
        <BottomSheetFlatList
          data={
            places?.map(p => ({
              title: p.room.name ?? t('common.untitled'),
              subtitle: `${t('common.free')} ${formatHHmm(
                p.freeFrom,
              )} - ${formatHHmm(p.freeTo)}`,
              linkTo: { screen: 'Place', params: { placeId: p.id } },
            })) ?? []
          }
          renderItem={({ item }: { item: ListItemProps }) => (
            <ListItem
              leadingItem={<Icon icon={faMapPin} size={fontSizes['2xl']} />}
              {...item}
              title={item.title ?? t('common.untitled')}
            />
          )}
          ItemSeparatorComponent={IndentedDivider}
          ListEmptyComponent={
            isLoadingRooms ? (
              <ActivityIndicator style={{ marginVertical: spacing[8] }} />
            ) : (
              <EmptyState message={t('freeRoomsScreen.noFreeRooms')} />
            )
          }
        />
      </BottomSheet>
    </View>
  );
};
