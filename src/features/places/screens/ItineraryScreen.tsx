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
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import {
  faCrosshairs,
  faExpand,
} from '@fortawesome/free-solid-svg-icons';
import { Divider } from '@lib/ui/components/Divider';
import { IconButton } from '@lib/ui/components/IconButton';
import { Col } from '@lib/ui/components/Col';
import { TranslucentCard } from '@lib/ui/components/TranslucentCard';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import Mapbox from '@rnmapbox/maps';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { PathLayer } from '../components/PathLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { MapNavigatorContext } from '../contexts/MapNavigatorContext';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { MarkersLayer } from '../components/MarkersLayer';
import { useNavigationPlaces } from '../hooks/useSearchPlaces';
import { SubPathSelector } from '~/features/places/components/SubPathSelector';
import { displayTabBar } from '~/utils/tab-bar';
import { useGetPath } from '~/core/queries/placesHooks';
import bbox from '@turf/bbox';
import { BBox } from 'geojson';

type Props = MapScreenProps<PlacesStackParamList, 'Itinerary'>;

export const ItineraryScreen = ({ navigation, route }: Props) => {
    const styles = useStylesheet(createStyles);
    const { spacing } = useTheme();
    const { t } = useTranslation();
    const campus = useGetCurrentCampus();
    const { cameraRef } = useContext(MapNavigatorContext);
   // const searchPlaceToListItem = useSearchPlaceToListItem();
    const [search] = useState('');
    const { floorId: floorId, setFloorId: setFloorId, selectedLine } = useContext(PlacesContext);    
    const [debouncedSearch] = useState(search);
    const bottomSheetPosition = useSharedValue(0);
    const [screenHeight, setScreenHeight] = useState(
        Dimensions.get('window').height,
    );
    const [chosenBbox, setChosenBbox] = useState<BBox | null>(null);

    const pathFeatureCollection = useGetPath().features;       

    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 10 }}
        >
          <View>
            <Animated.Text style={{ fontSize: 17, color: '#007AFF' }}>
              {t('itineraryScreen.backTitle')}
            </Animated.Text>
          </View>
        </TouchableOpacity>
      ),
      });
    }, [navigation, t]);

    const filteredPlacesParams = useMemo(() => {
      return {
        siteId: campus?.id,
        floorId: floorId,
        startRoom: route.params.startRoom,
        destRoom: route.params.destRoom
      };
    }, [campus?.id, floorId, route.params.startRoom, route.params.destRoom]);
    
    const { filteredPlaces: places } = useNavigationPlaces(
      filteredPlacesParams
    );    

    const centerToUserLocation = useCallback(async () => {
        const location = await Mapbox.locationManager.getLastKnownLocation();
        if (location) {
        const { latitude, longitude } = location.coords;
        cameraRef.current?.flyTo([longitude, latitude]);
        }
    }, [cameraRef]);

    const centerToCurrentCampus = useCallback(async () => {
        if (!campus || !cameraRef.current) {
        return;
        }
        const { latitude, longitude, extent } = campus;
        cameraRef.current.fitBounds(
        [longitude - extent, latitude - extent],
        [longitude + extent, latitude + extent],
        undefined,
        2000,
        );
    }, [cameraRef, campus]);
    const { selectedId, setSelectedId } = useContext(MapNavigatorContext);
    const renderMapContent = useCallback(
        () => (
        <>
            <PathLayer handleSegmentChange={setChosenBbox} />
            <MarkersLayer 
                places={places}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
            />
        </>
        ),
        [
        places,
        selectedId,
        setSelectedId,
        ],
    );
    useLayoutEffect(() => {
        if(chosenBbox){
          const bounds = {
              ne: [chosenBbox[2], chosenBbox[3]],
              sw: [chosenBbox[0], chosenBbox[1]],
          };
          navigation.setOptions({
          mapOptions: {
            camera: {
                padding: { paddingTop: screenHeight * 0.4, paddingBottom: 100, paddingLeft: 50, paddingRight: 50 },
                bounds: bounds,
                zoomLevel: 19,
              }
          },
          mapContent: renderMapContent,
          });
        }
    }, [
        debouncedSearch,
        navigation,
        renderMapContent,
        selectedLine,
        chosenBbox,
        screenHeight
    ]);

    useEffect(() => {
      const rootNav = navigation.getParent()!;
      return () => displayTabBar(rootNav);
    }, [navigation]);

    /*
    useEffect(() => {
      if(pathFeatureCollection && pathFeatureCollection.length > 0){
        //setSelectedLine("line-layer-0")
        setFloorId(pathFeatureCollection[0].features.properties.fn_fl_id);
      }
    }, [pathFeatureCollection, setFloorId, setSelectedLine]);*/

    const controlsAnimatedStyle = useAnimatedStyle(() => {
        return {
        opacity: 1,
        transform: [
            {
            translateY: Math.max(0.8 * screenHeight, bottomSheetPosition.value),
            },
        ],
        };
    });

    useEffect(()=>{
      if(selectedLine === 'line-layer-0'){
        setFloorId(pathFeatureCollection[0].features.properties.fn_fl_id)
        setChosenBbox(
          bbox({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: pathFeatureCollection[0].features.geometry.coordinates,
              },
              properties: {},
            }],
          })
        )
      }
    }, [selectedLine, pathFeatureCollection, setFloorId])

    /*
    useEffect(() => {
        if (campus)
          setFloorId(campus.floors[campus?.floors.findIndex(f => f.level >= 0)].id);
    }, [campus, setFloorId]);*/

    useLayoutEffect(() => {
      const parent = navigation.getParent();
      if (!parent) return;

      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });

      return () =>
      parent.setOptions({
        tabBarStyle: undefined,
      });
    }, [navigation]);

    useScreenTitle(
        t('itineraryScreen.title')
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
          <Animated.View style={[styles.controls, controlsAnimatedStyle]}>
            <Col gap={3} align="stretch" justify="space-between">
              <TranslucentCard
              >
                <IconButton
                  icon={faCrosshairs}
                  size={spacing[6]}
                  style={styles.icon}
                  accessibilityLabel={t('itineraryScreen.goToMyPosition')}
                  onPress={centerToUserLocation}
                />
                <Divider style={styles.divider} size={1} />
                <IconButton
                  icon={faExpand}
                  size={spacing[6]}
                  style={styles.icon}
                  accessibilityLabel={t('itineraryScreen.viewWholeCampus')}
                  onPress={centerToCurrentCampus}
                />
              </TranslucentCard>
            </Col>
            {
              pathFeatureCollection && pathFeatureCollection.length > 0 && selectedLine && (
                <SubPathSelector
                  lineId={0}
                />
              )
            }
          </Animated.View>
        </View>
      );
};
    
const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    controls: {
      position: 'absolute',
      left: spacing[5],
      right: spacing[5],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 12,
      alignSelf: 'stretch',
    },
    divider: {
      alignSelf: 'stretch',
    },
    loadingIcon: {
      marginBottom: spacing[2],
    },
    icon: {
      alignItems: 'center',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
});

