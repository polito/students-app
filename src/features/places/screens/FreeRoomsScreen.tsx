import {
  LegacyRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';

import {
  faChevronLeft,
  faChevronRight,
  faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { useGetFreeRooms } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { notNullish } from '../../../utils/predicates';
import { CampusSelector } from '../components/CampusSelector';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { PlaceOverviewWithMetadata, SearchPlace } from '../types';

type Props = MapScreenProps<PlacesStackParamList, 'FreeRooms'>;

export const FreeRoomsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { spacing, fontSizes } = useTheme();
  const campus = useGetCurrentCampus();
  const [initialDateTime] = useState(
    DateTime.now().set({ minute: 0, second: 0, millisecond: 0 }),
  );
  const [selectedTimeSlotIndex, setSelectedTimeSlotIndex] = useState(0);
  const startDateTime = useMemo(
    () => initialDateTime.plus({ hour: 3 * selectedTimeSlotIndex }),
    [initialDateTime, selectedTimeSlotIndex],
  );
  const { places: sitePlaces } = useSearchPlaces({ siteId: campus?.id });
  const { data: freeRooms, isLoading: isLoadingRooms } = useGetFreeRooms({
    siteId: campus?.id,
    date: startDateTime.toISO().split('T')[0],
    timeFrom: startDateTime.toISOTime(),
    timeTo: startDateTime.plus({ hour: 3 }).toISOTime(),
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
  const pagerRef = useRef<PagerView>();
  const displayFloorId = useMemo(() => {
    const floorIds = new Set(freeRooms?.data?.map(r => r.floorId));
    return floorIds.size === 1 ? Array.from(floorIds.values())[0] : undefined;
  }, [freeRooms?.data]);

  useEffect(() => {
    pagerRef.current?.setPage(selectedTimeSlotIndex);
  }, [selectedTimeSlotIndex]);

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
            disabled={!freeRooms?.data || !selectedTimeSlotIndex}
            onPress={() =>
              setSelectedTimeSlotIndex(prevIdx => Math.max(0, prevIdx - 1))
            }
          />
          <PagerView
            ref={pagerRef as LegacyRef<PagerView>}
            style={{
              flexGrow: 1,
              height: '100%',
            }}
            orientation="horizontal"
            initialPage={selectedTimeSlotIndex}
            onPageSelected={({ nativeEvent: { position } }) =>
              setSelectedTimeSlotIndex(position)
            }
          >
            {Array.from({ length: selectedTimeSlotIndex + 2 }).map(
              (_, slotIndex) => {
                const startDate = initialDateTime.plus({ hour: 3 * slotIndex });
                const endDate = startDate.plus({ hour: 3 });
                return (
                  <Text
                    key={slotIndex}
                    style={{
                      flexGrow: 1,
                      textTransform: 'capitalize',
                      textAlign: 'center',
                      marginVertical: spacing[2],
                    }}
                  >
                    {startDate.toRelativeCalendar()}{' '}
                    {startDate.toFormat('HH:mm')} - {endDate.toFormat('HH:mm')}
                  </Text>
                );
              },
            )}
          </PagerView>
          <IconButton
            icon={faChevronRight}
            color={colors.secondaryText}
            onPress={() => setSelectedTimeSlotIndex(prevIdx => prevIdx + 1)}
          />
        </Row>
        <BottomSheetFlatList
          data={
            places?.map(p => ({
              title:
                (p as PlaceOverviewWithMetadata).room.name ??
                t('common.untitled'),
              subtitle: `${t(
                'common.free',
              )} ${p.freeFrom.toLocaleTimeString()} - ${p.freeTo.toLocaleTimeString()}`,
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
            ) : undefined
          }
        />
      </BottomSheet>
    </View>
  );
};
