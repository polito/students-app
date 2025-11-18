import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import { ActivityIndicator, Image } from 'react-native';

import {
  faLocationDot,
  faMapPin,
  faSignsPost,
} from '@fortawesome/free-solid-svg-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheet as BottomSheetUI } from '@lib/ui/components/BottomSheet';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PlaceOverview } from '@polito/api-client';

import { notNullish } from '~/utils/predicates';

import { debounce } from 'lodash';

import { useFeedbackContext } from '../../../../src/core/contexts/FeedbackContext';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetPath, useGetPlaces } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesListFooter } from '../components/PlacesListFooter';
import { PlacesListHeader } from '../components/PlacesListHeader';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { PreViewPathLayer } from '../components/PreViewPathLayer';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { useNavigationPlaces, useSearchPlaces } from '../hooks/useSearchPlaces';

type Props = MapScreenProps<PlacesStackParamList, 'Indications'>;

export const IndicationsScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const campus = useGetCurrentCampus();
  const {
    setSelectedSegmentId,
    setSelectionMode,
    selectedPlace,
    setSelectedPlace,
    selectionIcon,
    setSelectionIcon,
  } = useContext(PlacesContext);
  const [_screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );
  const [totDistance, setTotDistance] = useState<number | null>(null);
  const [stairs, setStairs] = useState<number | null>(null);
  const [elevators, setElevators] = useState<number | null>(null);

  const { fromPlace: startRoom, toPlace: destRoom } = route.params;

  const [computeButtonState, setComputeButtonState] = useState(0);
  const [searchStart, setSearchStart] = useState(startRoom?.namePlace || '');
  const [searchDest, setSearchDest] = useState(destRoom?.namePlace || '');

  const [avoidStairs, setAvoidStairs] = useState<boolean>(false);
  const [isExpandedStart, setIsExpandedStart] = useState(false);
  const [isExpandedDest, setIsExpandedDest] = useState(false);

  const isExpandedStartRef = useRef(isExpandedStart);
  const isExpandedDestRef = useRef(isExpandedDest);
  //const { setSelectedId } = useContext(MapNavigatorContext);

  const { setFeedback } = useFeedbackContext();
  const [isFeedbackVisible, setFeedbackVisible] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);

  const [clickMode, setClickMode] = useState<number>(0); // 0 nothing, 1 start, 2 dest
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { fontSizes, spacing, palettes } = useTheme();

  const { data: sitePlaces } = useSearchPlaces({ siteId: campus?.id });
  const { data: listPlaces, isLoading } = useGetPlaces({
    siteId: campus?.id,
  });
  const innerRef = useRef<BottomSheet>(null);

  const handleRoom = useCallback(
    (place: PlaceOverview | undefined, isStartRoom: boolean) => {
      if (isStartRoom) {
        if (place)
          navigation.setParams({
            fromPlace: {
              placeId: place.id,
              namePlace: place?.room.name
                ? place.room.name
                : place?.category.name,
            },
          });
        else navigation.setParams({ fromPlace: undefined });
      } else {
        if (place)
          navigation.setParams({
            toPlace: {
              placeId: place.id,
              namePlace: place?.room.name
                ? place.room.name
                : place?.category.name,
            },
          });
        else navigation.setParams({ toPlace: undefined });
      }
    },
    [navigation],
  );

  const provideFeedback = useCallback(() => {
    setComputeButtonState(0);
    setFeedbackVisible(true);
    setFeedback({
      text: t('indicationsScreen.pathNotFound'),
      isPersistent: true,
      action: {
        label: t('common.ok'),
        onPress: () => {
          handleRoom(undefined as any, true);
          setSearchStart('');
          setDebouncedSearch('');
          setFeedbackVisible(false);
        },
      },
    });
  }, [setFeedback, t, handleRoom, setDebouncedSearch, setSearchStart]);

  const { filteredPlaces: places } = useNavigationPlaces({
    siteId: campus?.id,
  });

  const { data: pathFeat, isLoading: isLoadingPath } = useGetPath({
    startPlaceId: startRoom?.placeId || '',
    destPlaceId: destRoom?.placeId || '',
    avoidStairs: avoidStairs,
    computeButtonState: computeButtonState,
    generateFeedback: provideFeedback,
  });

  useEffect(() => {
    if (pathFeat && pathFeat.data.features.length > 0) {
      setTotDistance(pathFeat.data.totDistance);
      setStairs(pathFeat.data.stairsCount || 0);
      setElevators(pathFeat.data.elevatorsCount || 0);
    }
  }, [pathFeat]);

  const renderMapContent = useCallback(() => {
    if (
      pathFeat &&
      pathFeat.data.features.length > 0 &&
      computeButtonState === 1
    ) {
      return (
        <>
          <MarkersLayer places={places} />
          <PreViewPathLayer
            pathFeat={pathFeat}
            bottomSheetHeight={bottomSheetHeight}
            navigation={navigation}
          />
        </>
      );
    }

    if (!pathFeat) {
      return <MarkersLayer places={places} />;
    }

    return null;
  }, [places, pathFeat, bottomSheetHeight, navigation, computeButtonState]);

  useLayoutEffect(() => {
    navigation.setOptions({
      mapContent: renderMapContent,
    });
  }, [navigation, renderMapContent]);

  useEffect(() => {
    isExpandedStartRef.current = isExpandedStart;
  }, [isExpandedStart]);

  useEffect(() => {
    isExpandedDestRef.current = isExpandedDest;
  }, [isExpandedDest]);

  const allPlaces = useMemo(() => {
    const list = listPlaces?.data ?? [];
    return list
      .map(fr => {
        const place = sitePlaces?.find(p => p.id === fr.id) as PlaceOverview;
        if (
          !place ||
          place.category.name === 'Scale' ||
          place.category.name === 'Ascensori'
        )
          return null;

        if (debouncedSearch && debouncedSearch.length > 0) {
          if (place.room) {
            if (
              !place.room.name ||
              !place.room.name.toLowerCase().includes(debouncedSearch)
            ) {
              return null;
            }
          } else {
            if (
              !place.category.name ||
              place.category.name.toLowerCase().includes(debouncedSearch)
            ) {
              return null;
            }
          }
        }

        return { ...fr, ...place };
      })
      ?.filter(notNullish);
  }, [listPlaces?.data, debouncedSearch, sitePlaces]);

  type SpecialItem = {
    type: 'special';
    id: 'special';
    title?: string;
  };
  type PlaceItem = {
    type: 'place';
    place: PlaceOverview;
  };

  type ListDataItem = SpecialItem | PlaceItem;

  const dataWithDefault = useMemo(() => {
    if (!isExpandedStart && !isExpandedDest) return [];
    return [
      {
        type: 'special',
        id: 'special',
        title: 'Seleziona dalla mappa',
      } as SpecialItem,
      ...(allPlaces ?? []).map(p => ({ type: 'place', place: p }) as PlaceItem),
    ] as ListDataItem[];
  }, [isExpandedStart, isExpandedDest, allPlaces]);

  const triggerSearchStart = useCallback(() => {
    debounce(() => setDebouncedSearch(searchStart.trim().toLowerCase()), 100, {
      leading: true,
    })();
  }, [searchStart]);

  const triggerSearchDest = useCallback(() => {
    debounce(() => setDebouncedSearch(searchDest.trim().toLowerCase()), 100, {
      leading: true,
    })();
  }, [searchDest]);

  useEffect(() => {
    if (isExpandedStart || isExpandedDest) {
      innerRef.current?.expand();
    } else if (!isExpandedDest && !isExpandedStart) {
      innerRef.current?.snapToIndex(0);
    }
  }, [isExpandedDest, isExpandedStart]);

  const handleItemPress = useCallback(
    (item: ListDataItem) => {
      const currentIsExpandedStart = isExpandedStartRef.current;
      const currentIsExpandedDest = isExpandedDestRef.current;

      if (item.type === 'special') {
        if (currentIsExpandedStart) {
          setClickMode(1);
          setSelectionIcon('start');
          navigation.navigate('MapSelection', {
            clickMode,
          });
        } else if (currentIsExpandedDest) {
          setClickMode(2);
          setSelectionIcon('destination');
          navigation.navigate('MapSelection', {
            clickMode: clickMode,
          });
        }
      } else {
        const itemName = item.place.room.name ?? t('common.untitled');
        if (currentIsExpandedStart) {
          handleRoom(item.place, true);
          setSearchStart(itemName);
          setIsExpandedStart(false);
        } else if (currentIsExpandedDest) {
          handleRoom(item.place, false);
          setSearchDest(itemName);
          setIsExpandedDest(false);
        }
      }
    },
    [
      setClickMode,
      handleRoom,
      setSearchStart,
      setIsExpandedStart,
      setSearchDest,
      setIsExpandedDest,
      setSelectionIcon,
      //setSelectedId,
      navigation,
      clickMode,
      //setDebouncedSearch,
      //setSelectionMode,
      t,
    ],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListDataItem }) => {
      if (item.type === 'special') {
        return (
          <ListItem
            leadingItem={
              <Icon
                icon={faLocationDot}
                color={dark ? palettes.lightBlue[400] : palettes.lightBlue[700]}
                size={fontSizes['2xl']}
              />
            }
            title={t('indicationsScreen.mapSelectorItem')}
            onPress={() => {
              handleItemPress(item);
              setSelectionMode(true);
            }}
          />
        );
      } else {
        return (
          <ListItem
            leadingItem={
              item.place.category.markerUrl ? (
                <Image
                  source={{ uri: item.place.category.markerUrl }}
                  width={30}
                  height={30}
                />
              ) : (
                <Icon icon={faMapPin} size={fontSizes['2xl']} />
              )
            }
            title={item.place.room.name ?? t('common.untitled')}
            subtitle={`${item.place.category.name} - ${item.place.floor.name}`}
            onPress={() => {
              handleItemPress(item);
            }}
          />
        );
      }
    },
    [handleItemPress, fontSizes, setSelectionMode, dark, palettes, t],
  );

  const listHeader = useMemo(() => {
    return (
      <PlacesListHeader
        isExpandedStart={isExpandedStart}
        isExpandedDest={isExpandedDest}
        searchStart={searchStart}
        searchDest={searchDest}
        computeButtonState={computeButtonState}
        distance={totDistance ? totDistance : 0}
        stairs={stairs ? stairs : 0}
        elevators={elevators ? elevators : 0}
        avoidStairs={avoidStairs}
        dark={dark}
        setIsExpandedStart={setIsExpandedStart}
        setIsExpandedDest={setIsExpandedDest}
        handleSearchStart={setSearchStart}
        handleSearchDest={setSearchDest}
        handleRoom={handleRoom}
        handleDebouncedSearch={setDebouncedSearch}
        handleComputeButtonState={setComputeButtonState}
        setAvoidStairs={setAvoidStairs}
        triggerSearchStart={triggerSearchStart}
        triggerSearchDest={triggerSearchDest}
      />
    );
  }, [
    isExpandedStart,
    isExpandedDest,
    computeButtonState,
    totDistance,
    stairs,
    elevators,
    avoidStairs,
    dark,
    searchStart,
    searchDest,
    handleRoom,
    setDebouncedSearch,
    setComputeButtonState,
    triggerSearchStart,
    triggerSearchDest,
  ]);

  const listFooter = useMemo(() => {
    return (
      <PlacesListFooter
        computeButtonState={computeButtonState}
        startRoomLength={startRoom?.placeId.length || 0}
        destinationRoomLength={destRoom?.placeId.length || 0}
        handleComputeButtonState={setComputeButtonState}
        isLoading={isLoadingPath}
        showItinerary={() => {
          if (
            startRoom?.placeId &&
            destRoom?.placeId &&
            pathFeat?.data.features.length
          ) {
            setSelectedSegmentId(pathFeat.data.features[0].segmentId);
            navigation.navigate('Itinerary', {
              pathFeat: pathFeat,
              startRoom: startRoom.placeId,
              destRoom: destRoom.placeId,
            });
          }
        }}
      />
    );
  }, [
    computeButtonState,
    navigation,
    startRoom,
    destRoom,
    setComputeButtonState,
    setSelectedSegmentId,
    isLoadingPath,
    pathFeat,
  ]);

  useEffect(() => {
    if (selectedPlace) {
      handleRoom(selectedPlace, selectionIcon === 'start');
      if (selectionIcon === 'start')
        setSearchStart(
          selectedPlace?.room.name
            ? selectedPlace.room.name
            : selectedPlace?.category.name,
        );
      else if (selectionIcon === 'destination')
        setSearchDest(
          selectedPlace?.room.name
            ? selectedPlace.room.name
            : selectedPlace?.category.name,
        );
    }
    setIsExpandedDest(false);
    setIsExpandedStart(false);
    setClickMode(0);
    setDebouncedSearch('');
    setSelectionMode(false);
    setSelectedPlace(null);
  }, [
    selectedPlace,
    handleRoom,
    selectionIcon,
    clickMode,
    setSelectionMode,
    setDebouncedSearch,
    setSelectedPlace,
    setSearchStart,
    setSearchDest,
  ]);

  useScreenTitle(t('indicationsScreen.title'));

  return (
    <View
      style={GlobalStyles.grow}
      pointerEvents="box-none"
      onLayout={({
        nativeEvent: {
          layout: { height },
        },
      }) => setScreenHeight(height)}
    >
      {clickMode === 0 && (
        <BottomSheetUI
          ref={innerRef}
          index={computeButtonState === 0 ? 0 : 1}
          snapPoints={['43%', '55%', '100%']}
          onChange={(_, pos) => setBottomSheetHeight(pos)}
        >
          <BottomSheetFlatList<ListDataItem>
            data={dataWithDefault}
            keyExtractor={(item, index) =>
              item.type === 'special'
                ? `special-item-${index}`
                : `${item.place.id ?? index}`
            }
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={IndentedDivider}
            ListEmptyComponent={
              isExpandedStart || isExpandedDest ? (
                isLoading ? (
                  <ActivityIndicator style={{ marginVertical: spacing[8] }} />
                ) : (
                  <EmptyState
                    message={t('placesScreen.noPlacesFound')}
                    icon={faSignsPost}
                  />
                )
              ) : null
            }
            ListHeaderComponent={listHeader}
            ListFooterComponent={
              !isExpandedStart && !isExpandedDest && !isFeedbackVisible
                ? listFooter
                : null
            }
          />
        </BottomSheetUI>
      )}
    </View>
  );
};
