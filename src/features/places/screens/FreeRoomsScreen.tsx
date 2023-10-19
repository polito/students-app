import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
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

import { last } from 'lodash';
import { DateTime } from 'luxon';

import { useGetFreeRooms } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatTime } from '../../../utils/dates';
import { notNullish } from '../../../utils/predicates';
import { CampusSelector } from '../components/CampusSelector';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { FREE_ROOMS_TIME_WINDOW_SIZE_HOURS } from '../constants';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { PlaceOverviewWithMetadata, SearchPlace } from '../types';

type Props = MapScreenProps<PlacesStackParamList, 'FreeRooms'>;

const slotStartHour = [17, 14, 11, 8];

const findNearestSlotStartHour = (dt: DateTime) => {
  const nearestStartHour = slotStartHour.find(h => h <= dt.hour);

  if (nearestStartHour && dt.hour < 20) {
    dt = dt.set({ hour: nearestStartHour });
  } else {
    if (dt.hour > slotStartHour[0]) {
      dt = dt.plus({ day: 1 }).set({
        hour: last(slotStartHour),
      });
    } else {
      // dt.hour < last(slotStartHour)
      dt = dt.minus({ day: 1 }).set({
        hour: slotStartHour[0],
      });
    }
  }

  return dt.set({
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
  const [initialDateTime] = useState(
    DateTime.now().set({ minute: 0, second: 0, millisecond: 0 }),
  );
  const [startDateTime, setStartDateTime] = useState(initialDateTime);

  const endDateTime = useMemo(
    () =>
      startDateTime.plus({
        hour: FREE_ROOMS_TIME_WINDOW_SIZE_HOURS,
      }),
    [startDateTime],
  );

  useEffect(() => {
    setStartDateTime(findNearestSlotStartHour(DateTime.now().startOf('hour')));
  }, []);

  const { places: sitePlaces } = useSearchPlaces({ siteId: campus?.id });
  const { data: freeRooms, isLoading: isLoadingRooms } = useGetFreeRooms({
    siteId: campus?.id,
    date: startDateTime.toISO().split('T')[0],
    timeFrom: startDateTime.toISOTime(),
    timeTo: endDateTime.toISOTime(),
  });
  const places = useMemo(
    () =>
      freeRooms?.data
        .map(fr => {
          const place = sitePlaces?.find(p => p.id === fr.id);
          if (!place) return null;
          return { ...fr, ...place };
        })
        ?.filter(notNullish) as (SearchPlace & {
        freeFrom: Date;
        freeTo: Date;
      })[],
    [freeRooms?.data, sitePlaces],
  );
  const displayFloorId = useMemo(() => {
    const floorIds = new Set(freeRooms?.data?.map(r => r.floorId));
    return floorIds.size === 1 ? Array.from(floorIds.values())[0] : undefined;
  }, [freeRooms?.data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <CampusSelector />,
      mapContent: (
        <>
          <IndoorMapLayer floorId={displayFloorId} />
          <MarkersLayer places={places ?? []} displayFloor={!displayFloorId} />
        </>
      ),
    });
  }, [displayFloorId, navigation, places]);

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <BottomSheet
        index={1}
        snapPoints={[64, '30%', '100%']}
        android_keyboardInputMode="adjustResize"
      >
        <Row align="center" gap={2} ph={1}>
          <IconButton
            icon={faChevronLeft}
            color={colors.secondaryText}
            disabled={!freeRooms?.data}
            onPress={() =>
              setStartDateTime(prevDt =>
                findNearestSlotStartHour(prevDt.minus({ hour: 3 })),
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
              {startDateTime.toRelativeCalendar()}{' '}
              {startDateTime.toFormat('HH:mm')} -{' '}
              {endDateTime.toFormat('HH:mm')}
            </Text>
          </View>
          <IconButton
            icon={faChevronRight}
            color={colors.secondaryText}
            disabled={!freeRooms?.data}
            onPress={() =>
              setStartDateTime(prevDt =>
                findNearestSlotStartHour(prevDt.plus({ hour: 3 })),
              )
            }
          />
        </Row>
        <BottomSheetFlatList
          data={
            places?.map(p => ({
              title:
                (p as PlaceOverviewWithMetadata).room.name ??
                t('common.untitled'),
              subtitle: `${t('common.free')} ${formatTime(
                p.freeFrom,
              )} - ${formatTime(p.freeTo)}`,
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
