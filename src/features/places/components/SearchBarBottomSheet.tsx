import { ActivityIndicator, Image } from 'react-native';
import {
  faLocationDot,
  faMapPin,
  faSignsPost,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { BottomSheetFlatList, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { ListItem } from '@lib/ui/components/ListItem';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { useTranslation } from 'react-i18next';
import { PlaceOverview } from '@polito/api-client';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { useGetPlaces } from '../../../core/queries/placesHooks';
import { useGetCurrentCampus } from '~/features/places/hooks/useGetCurrentCampus';
import { useSearchPlaces } from '~/features/places/hooks/useSearchPlaces';
import { notNullish } from '~/utils/predicates';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { PlacesContext } from '~/features/places/contexts/PlacesContext';
import { MarkerSelectionBottomSheet } from './MarkerSelectionBottomSheet';
import { PlacesListHeader } from './PlacesListHeader';
import { PlacesListFooter } from './PlacesListFooter';
import { start } from 'repl';

type Props = {
    showItinerary: () => void;
    distance?: number | null;
    stairsOrElevators?: number | null;

    startRoom: string;
    handleStartRoom: (room: string) => void;
    destinationRoom: string;
    handleDestinationRoom: (room: string) => void;
    debouncedSearch: string;
    handleDebouncedSearch: (search: string) => void;
    computeButtonState: number;
    handleComputeButtonState: (state?: number) => void;

    searchDest: string;
    handleSearchDest: (dest: string) => void;
    searchStart: string;
    handleSearchStart: (start: string) => void;

    handleShowControls: (show: boolean) => void;
};

export const SearchBarBottomSheet = ({ showItinerary, startRoom, handleStartRoom, destinationRoom, handleDestinationRoom, debouncedSearch, handleDebouncedSearch, computeButtonState, handleComputeButtonState, searchDest, handleSearchDest, searchStart, handleSearchStart, distance, stairsOrElevators, handleShowControls }: Props) => {
    const { dark } = useTheme();
    const { selectedPlace } = useContext(PlacesContext);
    const [avoidStairs, setAvoidStairs] = useState<boolean>(false);

    const [isExpandedStart, setIsExpandedStart] = useState(false);
    const [isExpandedDest, setIsExpandedDest] = useState(false);

    const isExpandedStartRef = useRef(isExpandedStart);
    const isExpandedDestRef = useRef(isExpandedDest);

    useEffect(() => {
        isExpandedStartRef.current = isExpandedStart;
    }, [isExpandedStart]);

    useEffect(() => {
        isExpandedDestRef.current = isExpandedDest;
    }, [isExpandedDest]);

    const [clickMode, setClickMode] = useState<number>(0);  //0 nothing, 1 start, 2 dest

    const { fontSizes, spacing } = useTheme();
    const { t } = useTranslation();

    const campus = useGetCurrentCampus();
    const { data: sitePlaces } = useSearchPlaces({ siteId: campus?.id });
    const { data: listPlaces, isLoading } = useGetPlaces({
        siteId: campus?.id,
    });
    const innerRef = useRef<BottomSheetMethods>(null);
    
    //useImperativeHandle(ref, () => innerRef.current!);

    const places = useMemo(
        () =>{
            const list = listPlaces?.data ?? [];
          return list.map(fr => {
              const place = sitePlaces?.find(p => p.id === fr.id) as PlaceOverview;
              if (!place || place.category.name === 'Scale' || place.category.name === 'Ascensori') return null;

              if (debouncedSearch && debouncedSearch.length > 0) {
                  if (place.room) {
                    if(!place.room.name || !place.room.name.toLowerCase().includes(debouncedSearch)) {
                      return null;
                    }
                  }
                  else{
                    if(!place.category.name || place.category.name.toLowerCase().includes(debouncedSearch)) {
                      return null;
                    }
                  }
              }

              return { ...fr, ...place };
            })
            ?.filter(notNullish)},
        [listPlaces?.data, debouncedSearch, sitePlaces],
    );

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
            { type: 'special', id: 'special', title: 'Seleziona dalla mappa' } as SpecialItem,
            ...(places ?? []).map(p => ({ type: 'place', place: p } as PlaceItem)),
        ] as ListDataItem[];
    }, [isExpandedStart, isExpandedDest, places]);
            
    const triggerSearchStart = useCallback(
        () => {
            debounce(() => handleSearchStart(searchStart.trim().toLowerCase()), 100, {
                leading: true,
            })();
        },
        [searchStart],
    );

    const triggerSearchDest = useCallback(
        () => {
            debounce(() => handleSearchDest(searchDest.trim().toLowerCase()), 100, {
                leading: true,
            })();
        },
        [searchDest],
    );

    useEffect(() => {
            if (isExpandedStart || isExpandedDest) {
                innerRef.current?.expand();            //snaps to max index (100%) 
            }
            else if(!isExpandedDest && !isExpandedStart){
                innerRef.current?.snapToIndex(0);
            }  
    }, [isExpandedDest, isExpandedStart]);

    const handleItemPress = useCallback(
    (item: ListDataItem) => {
        const currentIsExpandedStart = isExpandedStartRef.current;
        const currentIsExpandedDest = isExpandedDestRef.current;

        // La logica che era dentro l'onPress del ListItem va qui
        if (item.type === 'special') {
            if (currentIsExpandedStart) setClickMode(1);
            else if (currentIsExpandedDest) setClickMode(2);
            handleShowControls(true);
        } else {
            const itemName = item.place.room.name ?? t('common.untitled');
            if (currentIsExpandedStart) {
                handleStartRoom(itemName);
                handleSearchStart(itemName);
                setIsExpandedStart(false);
            } else if (currentIsExpandedDest) {
                handleDestinationRoom(itemName);
                handleSearchDest(itemName);
                setIsExpandedDest(false);
            }
        }
    },
    [
        isExpandedStart, // Purtroppo necessario per la logica
        isExpandedDest,  // Purtroppo necessario per la logica
        setClickMode,
        handleShowControls,
        handleStartRoom, 
        handleSearchStart, 
        setIsExpandedStart,
        handleDestinationRoom,
        handleSearchDest, 
        setIsExpandedDest
    ]
);

    const renderItem = useCallback(
        ({ item }: { item: ListDataItem }) => {
            if (item.type === 'special') {
            return (
                <ListItem
                leadingItem={<Icon icon={faLocationDot} size={fontSizes['2xl']} />}
                title={t('Seleziona dalla mappa')}
                onPress={() => {
                    handleItemPress(item)
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
        [
            handleItemPress,
        ]
    );

    const listHeader = useMemo(() => {
        return (
            <PlacesListHeader
                isExpandedStart={isExpandedStart}
                isExpandedDest={isExpandedDest}
                searchStart={searchStart}
                searchDest={searchDest}
                computeButtonState={computeButtonState}
                distance={distance ? distance : 0}
                stairsOrElevators={ stairsOrElevators ? stairsOrElevators : 0}
                avoidStairs={avoidStairs}
                dark={dark}
                setIsExpandedStart={setIsExpandedStart}
                setIsExpandedDest={setIsExpandedDest}
                handleSearchStart={handleSearchStart}
                handleSearchDest={handleSearchDest}
                handleStartRoom={handleStartRoom}
                handleDestinationRoom={handleDestinationRoom}
                handleDebouncedSearch={handleDebouncedSearch}
                handleComputeButtonState={handleComputeButtonState}
                setAvoidStairs={setAvoidStairs}
                triggerSearchStart={triggerSearchStart}
                triggerSearchDest={triggerSearchDest}
        />);
    }, [
        isExpandedStart, 
        isExpandedDest, 
        computeButtonState,
        distance,
        stairsOrElevators,
        avoidStairs
    ]);

    const listFooter = useMemo(() => {
    return (
        <PlacesListFooter 
            computeButtonState={computeButtonState}
            startRoomLength={startRoom.length}
            destinationRoomLength={destinationRoom.length}
            handleComputeButtonState={handleComputeButtonState}
            showItinerary={showItinerary}
        />);
    }, [
        isExpandedStart, 
        isExpandedDest, 
        computeButtonState,
        startRoom.length, 
        destinationRoom.length,
    ]);

    return (
        <>
            <BottomSheet
                ref={innerRef}
                index={
                    clickMode > 0 && !selectedPlace ? 0 : distance && distance > 0 ? 0 : 1
                }
                snapPoints={
                [
                        '32%',
                        '43%',
                        '100%',
                    ]
                }
            >
                {
                   clickMode == 0 ? (
                    <BottomSheetFlatList<ListDataItem>
                        data={dataWithDefault}
                        keyExtractor={(item, index) =>   item.type === 'special'
                                    ? `special-item-${index}`
                                    : `${item.place.id ?? index}`}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                        ItemSeparatorComponent={IndentedDivider}
                        ListEmptyComponent={
                        (isExpandedStart || isExpandedDest) ? (
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
                        ListHeaderComponent={
                            listHeader
                        }
                        ListFooterComponent={
                            listFooter
                        }
                    />) :
                    (
                            <BottomSheetScrollView>
                                <MarkerSelectionBottomSheet action={() => {
                                    if(selectedPlace){
                                        if(clickMode == 1){
                                            if(selectedPlace.room.name)
                                                handleStartRoom(selectedPlace.room.name);
                                            else
                                                handleStartRoom(selectedPlace.category.name);
                                            handleSearchStart(selectedPlace.room.name);
                                            //triggerSearchStart?.();
                                        }else if(clickMode == 2){
                                            if(selectedPlace.room.name)
                                                handleDestinationRoom(selectedPlace.room.name);
                                            else
                                                handleDestinationRoom(selectedPlace.category.name);
                                            handleSearchDest(selectedPlace.room.name);
                                        }
                                    }
                                    setIsExpandedDest(false);
                                    setIsExpandedStart(false);
                                    setClickMode(0);
                                    handleDebouncedSearch('');
                                    handleShowControls(false);
                                }}
                                clickMode={clickMode}
                                />
                            </BottomSheetScrollView>
                    )
                }
            </BottomSheet>
        </>    
    );
};
