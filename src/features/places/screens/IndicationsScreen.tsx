import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
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
import { useGetPath } from '~/core/queries/placesHooks';
import bbox from '@turf/bbox';

type Props = MapScreenProps<PlacesStackParamList, 'Indications'>;

export const IndicationsScreen = ({ navigation, route }: Props) => {
    const { t } = useTranslation();
    const campus = useGetCurrentCampus();
    const { floorId: floorId, setSelectedLine } = useContext(PlacesContext);
    const [screenHeight, setScreenHeight] = useState(
        Dimensions.get('window').height,
    );
    const [pathFeatureCollection, setPathFeatureCollection] = useState<any[] | null>(null);
    const [totDistance, setTotDistance] = useState<number | null>(null);
    const [stairsOrElevators, setStairsOrElevators] = useState<number | null>(null);

    const { fromPlace: startRoom, toPlace: destRoom } = route.params

    const [computeButtonState, setComputeButtonState] = useState(startRoom && startRoom.length > 0 ? 1 : 0);

    const [searchStart, setSearchStart] = useState(startRoom ?? '');
    const [searchDest, setSearchDest] = useState(destRoom ?? '');

    const handleStartRoom = ((room: string) => {
      navigation.setParams({ fromPlace: room });
    });

    const handleDestRoom = ((room: string) => {
      navigation.setParams({ toPlace: room });
    });

    /*
    const handleComputeButtonState = () => {
      if(computeButtonState === 0 && startRoom && startRoom.length > 0 && destRoom && destRoom.length > 0){
        setComputeButtonState(1);
      } 
      else {
        setComputeButtonState(0);
      }
    };*/

    const navigationParams = useMemo(() => {
      return {
        siteId: campus?.id,
        floorId: floorId,
      }
    }, [campus?.id, floorId]);

    const { filteredPlaces: places } = useNavigationPlaces(
      navigationParams
    );

    const { selectedId, setSelectedId } = useContext(MapNavigatorContext);

    useLayoutEffect(() => {
        if(pathFeatureCollection && pathFeatureCollection.length > 0){
          const allCoordinates = pathFeatureCollection.flatMap(feat => feat.features.geometry.coordinates);
          const pathBbox = bbox({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: allCoordinates,
              },
              properties: {},
            }],
          });

          const bounds = {
              ne: [pathBbox[2], pathBbox[3]],
              sw: [pathBbox[0], pathBbox[1]],
          };

          navigation.setOptions({
          mapOptions: {
              camera: {
                padding: { paddingTop: screenHeight * 0.4, paddingBottom: 100, paddingLeft: 50, paddingRight: 50 },
                bounds: bounds,
                zoomLevel: 19,
              }
          },
          mapContent: () => (
          <>
              <MarkersLayer 
                  places={places}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
              />
              {
                pathFeatureCollection && pathFeatureCollection.length > 0 &&
                (
                  <PreViewPathLayer />
                )
              }
          </>),
        });
        }
        else{
          navigation.setOptions({
            mapContent: () => (
                <MarkersLayer 
                    places={places}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                />
          ),
          }); 

        }
    }, [navigation, pathFeatureCollection, places, selectedId, screenHeight, setSelectedId]);

    /*
    useMemo(() => {
      let shouldResetPath = false;

      if(startRoom && startRoom.length > 0 && startRoom !== route.params.fromPlace){
        navigation.setParams({ fromPlace: startRoom });
      }
      else if(startRoom && startRoom.length === 0){
        shouldResetPath = true;
      }
      if(destRoom && destRoom.length > 0 && destRoom !== route.params.toPlace){
        navigation.setParams({ toPlace: destRoom });
      }
      else if(destRoom && destRoom.length === 0){
        shouldResetPath = true;
      }

      if(shouldResetPath){
        setPathFeatureCollection(null);
        setTotDistance(null);
        setStairsOrElevators(null);
      }
    }, [route.params.fromPlace, route.params.toPlace, navigation]);*/
    
    const featureCollection = useGetPath();

    useEffect(() => {     // occhio qua
      if(computeButtonState === 1){
        setPathFeatureCollection(featureCollection.features);
        setTotDistance(featureCollection.totDistance);
        setStairsOrElevators(featureCollection.stairsOrElevatorsCount);
      }
      else{
        setPathFeatureCollection([]);
        setTotDistance(null);
        setStairsOrElevators(null);
      }
    }, [computeButtonState, featureCollection]);

    /*
    useEffect(() => {
      if (
        (route.params.fromPlace &&
        route.params.fromPlace.length === 0) ||
        route.params.toPlace.length === 0
      ) {
        setPathFeatureCollection([]);
      }
    }, [route.params.fromPlace, route.params.toPlace]);*/

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
            showItinerary={() => {
              setSelectedLine("line-layer-0");
              navigation.navigate('Itinerary', { startRoom: startRoom ?? '', destRoom: destRoom ?? '' })}} 
            destinationRoom={destRoom}
            startRoom={startRoom}
            searchStart={searchStart}
            searchDest={searchDest}
            handleStartRoom={handleStartRoom}
            handleDestinationRoom={handleDestRoom}
            handleSearchStart={setSearchStart}
            handleSearchDest={setSearchDest}
            computeButtonState={computeButtonState ?? 0}
            handleComputeButtonState={setComputeButtonState}
            distance={totDistance}
            stairsOrElevators={stairsOrElevators}
          />
        </View>
      );
};