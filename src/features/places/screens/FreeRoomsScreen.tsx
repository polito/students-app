import {
  LegacyRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
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
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { PlaceOverview } from '@polito/api-client';

import { useGetFreeRooms } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CampusSelector } from '../components/CampusSelector';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';

type Props = MapScreenProps<PlacesStackParamList, 'FreeRooms'>;

export const FreeRoomsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { spacing, fontSizes } = useTheme();
  const campus = useGetCurrentCampus();
  const { data: rooms, isLoading: isLoadingRooms } = useGetFreeRooms();
  const [selectedTimeSlotIndex, setSelectedTimeSlotIndex] = useState(0);
  const pagerRef = useRef<PagerView>();
  const displayFloorId = useMemo(() => {
    const floorIds = new Set(
      rooms?.data.flatMap(i => i.rooms).map(r => r.floor!.id),
    );
    return floorIds.size === 1 ? Array.from(floorIds.values())[0] : undefined;
  }, [rooms?.data]);

  useEffect(() => {
    pagerRef.current?.setPage(selectedTimeSlotIndex);
  }, [selectedTimeSlotIndex]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <CampusSelector />,
      mapContent: (
        <>
          <IndoorMapLayer floorId={displayFloorId} />
          <MarkersLayer
            places={
              (rooms?.data[selectedTimeSlotIndex].rooms as PlaceOverview[]) ??
              []
            }
            displayFloor={!displayFloorId}
          />
        </>
      ),
    });
  }, [displayFloorId, navigation, rooms?.data, selectedTimeSlotIndex]);

  const selectedSlot = useMemo(
    () => rooms?.data[selectedTimeSlotIndex],
    [rooms?.data, selectedTimeSlotIndex],
  );

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
            disabled={!rooms?.data || !selectedTimeSlotIndex}
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
            {rooms?.data.map(slot => (
              <Text
                key={slot.from.toISO()}
                style={{
                  flexGrow: 1,
                  textTransform: 'capitalize',
                  textAlign: 'center',
                  marginVertical: spacing[2],
                }}
              >
                {slot.from.toRelativeCalendar()} {slot.from.toFormat('HH:mm')} -{' '}
                {slot.to.toFormat('HH:mm')}
              </Text>
            ))}
          </PagerView>
          <IconButton
            icon={faChevronRight}
            color={colors.secondaryText}
            disabled={
              !rooms?.data || selectedTimeSlotIndex === rooms.data.length - 1
            }
            onPress={() =>
              setSelectedTimeSlotIndex(prevIdx =>
                Math.min(prevIdx + 1, rooms?.data ? rooms.data.length - 1 : 0),
              )
            }
          />
        </Row>
        <BottomSheetFlatList
          data={
            selectedSlot?.rooms.map(p => ({
              title: p.room!.name ?? p.category!.subCategory.name,
              subtitle: `${p.category!.name} - ${p.floor!.name}`,
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

const createStyles = ({ colors }: Theme) => StyleSheet.create({});
