import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { MapNavigatorContext } from '../contexts/MapNavigatorContext';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { MarkersLayer } from '../components/MarkersLayer';
import { useNavigationPlaces } from '../hooks/useSearchPlaces';
import { SearchBarBottomSheet } from '~/features/places/components/SearchBarBottomSheet';
import { PreViewPathLayer } from '../components/PreViewPathLayer';
import { Theme } from '@lib/ui/types/Theme';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useGetPath } from '~/core/queries/placesHooks';

type Props = MapScreenProps<PlacesStackParamList, 'Indications'>;

export const IndicationsScreen = ({ navigation, route }: Props) => {
    const { t } = useTranslation();
    const campus = useGetCurrentCampus();
    const { floorId: floorId, setFloorId: setFloorId } = useContext(PlacesContext);
    const [screenHeight, setScreenHeight] = useState(
        Dimensions.get('window').height,
    );
    const [pathFeatureCollection, setPathFeatureCollection] = useState<any[] | null>(null);
    const [totDistance, setTotDistance] = useState<number | null>(null);
    const [stairsOrElevators, setStairsOrElevators] = useState<number | null>(null);

    const [computeButtonState, setComputeButtonState] = useState(0);

    const [searchStart, setSearchStart] = useState(route.params.fromPlace ?? '');
    const [startRoom, setStartRoom] = useState(route.params.fromPlace ?? '');
    const [searchDest, setSearchDest] = useState(route.params.toPlace ?? '');
    const [destRoom, setDestRoom ] = useState(route.params.toPlace ?? '');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const handleComputeButtonState = (num?: number) => {
      if(num)
        setComputeButtonState(num);
      else
        setComputeButtonState(0);
    }

    const filteredPlacesParams = useMemo(() => ({
      siteId: campus?.id,
      floorId: floorId === 'XPTE' ? undefined : floorId,
    }), [campus?.id, floorId]);
    const { filteredPlaces: places } = useNavigationPlaces(filteredPlacesParams);

    const { selectedId, setSelectedId } = useContext(MapNavigatorContext);
    const styles = useStylesheet(createStyles);

    const renderMapContent = useCallback(
        () => (
          <>
              {
                pathFeatureCollection && (
                  <PreViewPathLayer />
                )
              }
              <MarkersLayer 
                  places={places}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
              />
          </>
        ),
        [
          places,
          pathFeatureCollection,
        ],
    );

    useLayoutEffect(() => {
        navigation.setOptions({
        mapContent: renderMapContent,
        });
    }, [
        navigation,
        renderMapContent,
    ]);

    useEffect(() => {
        if (campus)
          setFloorId(campus.floors[campus?.floors.findIndex(f => f.level >= 0)].id);
    }, [campus]);

    useEffect(() => {
      if(startRoom.length > 0){
        navigation.setParams({ fromPlace: startRoom });
      }
      if(destRoom.length > 0){
        navigation.setParams({ toPlace: destRoom });
      }
      if(startRoom.length == 0 || destRoom.length == 0){
        setPathFeatureCollection(null);
        setTotDistance(null);
        setStairsOrElevators(null);
      }
    }, [startRoom, destRoom]);
    
    useEffect(() => {     //cambia con useMemo
      if(computeButtonState == 1){
        const featureCollection = useGetPath();
        setPathFeatureCollection(featureCollection.features);
        setTotDistance(featureCollection.tot_distance);
        setStairsOrElevators(featureCollection.stair_or_elevators);
      }
    }, [computeButtonState]);

    useScreenTitle(
        t('indicationsScreen.title')
    );

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
          <SearchBarBottomSheet 
            showItinerary={() => {navigation.navigate('Itinerary')}} 
            destinationRoom={route.params.toPlace}
            startRoom={startRoom}
            searchStart={searchStart}
            searchDest={searchDest}
            handleStartRoom={setStartRoom}
            handleDestinationRoom={setDestRoom}
            handleSearchStart={setSearchStart}
            handleSearchDest={setSearchDest}
            debouncedSearch={debouncedSearch}
            handleDebouncedSearch={setDebouncedSearch}
            computeButtonState={computeButtonState}
            handleComputeButtonState={handleComputeButtonState}
            distance={totDistance}
            stairsOrElevators={stairsOrElevators}
          />
        </View>
      );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    loadingIcon: {
      marginBottom: spacing[2],
    },
    icon: {
      alignItems: 'center',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
  });