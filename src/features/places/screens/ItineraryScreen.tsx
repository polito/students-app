import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
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
import { displayTabBar } from '~/utils/tab-bar';
import { SearchBarBottomSheet } from '~/features/places/components/SearchBarBottomSheet';
import { PreViewPathLayer } from '../components/PreViewPathLayer';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { TranslucentCard } from '@lib/ui/components/TranslucentCard';
import { faChevronDown, faCrosshairs, faElevator, faExpand } from '@fortawesome/free-solid-svg-icons';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { IconButton } from '@lib/ui/components/IconButton';
import { Divider } from '@lib/ui/components/Divider';
import { Theme } from '@lib/ui/types/Theme';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import Mapbox from '@rnmapbox/maps';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useGetPath } from '~/core/queries/placesHooks';
import { start } from 'repl';

type Props = MapScreenProps<PlacesStackParamList, 'Itinerary'>;

export const ItineraryScreen = ({ navigation, route }: Props) => {
    const { t } = useTranslation();
    const campus = useGetCurrentCampus();
    const { floorId: floorId, setFloorId: setFloorId } = useContext(PlacesContext);
    const { spacing, fontSizes } = useTheme();
    const [screenHeight, setScreenHeight] = useState(
        Dimensions.get('window').height,
    );
    const bottomSheetPosition = useSharedValue(0);
    const { cameraRef } = useContext(MapNavigatorContext);
    const [pathFeatureCollection, setPathFeatureCollection] = useState<any[] | null>(null);
    const [totDistance, setTotDistance] = useState<number | null>(null);
    const [stairsOrElevators, setStairsOrElevators] = useState<number | null>(null);

    const [computeButtonState, setComputeButtonState] = useState(0);

    const [searchStart, setSearchStart] = useState('');
    const [startRoom, setStartRoom] = useState('');
    const [searchDest, setSearchDest] = useState('');
    const [destRoom, setDestRoom ] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showControls, setShowControls] = useState(false);

    const handleComputeButtonState = (num?: number) => {
      if(num)
        setComputeButtonState(num);
      else
        setComputeButtonState(prev => prev + 1);
    }

    useEffect(() => {
      if (route.params?.toPlace) {
        setSearchDest(route.params.toPlace);
        setDestRoom(route.params.toPlace);
      }
    }, [route.params?.toPlace]);

    const { filteredPlaces: places } = useNavigationPlaces({
        siteId: campus?.id,
        floorId: floorId === 'XPTE' ? undefined : floorId, //perchè se no mi esclude tutti i posti di XPTE
    });
    const { selectedId, setSelectedId } = useContext(MapNavigatorContext);
    const styles = useStylesheet(createStyles);

    const { accessibility } = usePreferencesContext();

    const floorSelectorButton = (
        <TranslucentCard
          {...(accessibility?.fontSize && Number(accessibility?.fontSize) >= 150
            ? { style: { height: 55 } }
            : {})}
        >
          <TouchableOpacity
            accessibilityLabel={t('placesScreen.changeFloor')}
            disabled={floorId != null}
          >
            <Row ph={3} pv={2.5} gap={1} align="center">
              {accessibility?.fontSize && Number(accessibility?.fontSize) < 150 && (
                <Icon icon={faElevator} />
              )}
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                {...(accessibility?.fontSize &&
                Number(accessibility?.fontSize) >= 150
                  ? { style: { height: 75, marginVertical: -20, maxWidth: 250 } }
                  : {
                      flexShrink: 1,
                      flexGrow: 1,
                      marginRight: 20,
                    })}
              >
                {campus?.floors.find(f => f.id === floorId)?.name}
              </Text>
              <Icon
                icon={faChevronDown}
                size={fontSizes.xs}
                style={{ position: 'absolute', right: 15 }}
              />
            </Row>
          </TouchableOpacity>
        </TranslucentCard>
    );

    const renderMapContent = useCallback(
        () => (
        <>
            <MarkersLayer 
                places={places}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
            />
            {
              pathFeatureCollection && (
                <PreViewPathLayer />
              )
            }
        </>
        ),
        [
          places,
          pathFeatureCollection,
        ],
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

    const controlsAnimatedStyle = useAnimatedStyle(() => {
          return {
          opacity: 1,
          transform: [
              {
              translateY: -bottomSheetPosition.value,     //TO FIX
              },
          ],
          };
      });

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

    
    useEffect(() => {     //cambia con useMemo
      if(computeButtonState == 1){
        const featureCollection = useGetPath();
        setPathFeatureCollection(featureCollection.features);
        setTotDistance(featureCollection.tot_distance);
        setStairsOrElevators(featureCollection.stair_or_elevators);
      }
    }, [computeButtonState]);

    useScreenTitle(
        t('Itinerario')
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
          {showControls && (
          <View style={[styles.controls, controlsAnimatedStyle]} pointerEvents="box-none">
            <Row gap={3} align="stretch" justify="space-between">
              <TranslucentCard>
                <IconButton
                  icon={faCrosshairs}
                  size={spacing[6]}
                  style={styles.icon}
                  accessibilityLabel={t('placesScreen.goToMyPosition')}
                  onPress={centerToUserLocation}
                />
                  <Divider style={styles.divider} size={1} />
                <IconButton
                  icon={faExpand}
                  size={spacing[6]}
                  style={styles.icon}
                  accessibilityLabel={t('placesScreen.viewWholeCampus')}
                  onPress={centerToCurrentCampus}
                />
              </TranslucentCard>
                <StatefulMenuView
                  style={{
                    maxWidth: '60%',
                  }}
                  onPressAction={({
                    nativeEvent: { event: selectedFloorId },
                  }) => {
                    setFloorId(selectedFloorId);
                  }}
                  actions={campus!.floors
                    .sort((a, b) => a.level - b.level)
                    .map(f => ({
                          id: f.id,
                          title: f.name,
                  }))}
                >
                  {floorSelectorButton}
                </StatefulMenuView>
          </Row>
          </View>)}
          <SearchBarBottomSheet 
            showItinerary={() => {navigation.navigate('NavigationItinerary')}} 
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
            handleShowControls={setShowControls}
            distance={totDistance}
            stairsOrElevators={stairsOrElevators}
          />
        </View>
      );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    controls: {
      position: 'absolute',
      left: spacing[5],
      right: spacing[5],
      top: spacing[5],
      display: 'flex',
      flexDirection: 'row',
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