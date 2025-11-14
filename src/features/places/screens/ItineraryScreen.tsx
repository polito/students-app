import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { faCrosshairs, faExpand } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Divider } from '@lib/ui/components/Divider';
import { IconButton } from '@lib/ui/components/IconButton';
import { TranslucentCard } from '@lib/ui/components/TranslucentCard';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import Mapbox from '@rnmapbox/maps';
import bbox from '@turf/bbox';

import { SubPathSelector } from '~/features/places/components/SubPathSelector';
import { displayTabBar } from '~/utils/tab-bar';

import { BBox } from 'geojson';

import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PathLayer } from '../components/PathLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { MapNavigatorContext } from '../contexts/MapNavigatorContext';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { useNavigationPlaces } from '../hooks/useSearchPlaces';

type Props = MapScreenProps<PlacesStackParamList, 'Itinerary'>;

export const ItineraryScreen = ({ navigation, route }: Props) => {
  const { pathFeat, startRoom, destRoom } = route.params;
  const styles = useStylesheet(createStyles);
  const { spacing, colors } = useTheme();
  const { t } = useTranslation();
  const campus = useGetCurrentCampus();
  const { cameraRef } = useContext(MapNavigatorContext);
  // const searchPlaceToListItem = useSearchPlaceToListItem();
  const {
    floorId: floorId,
    setFloorId: setFloorId,
    selectedLine,
  } = useContext(PlacesContext);
  const bottomSheetPosition = useSharedValue(0);
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );
  const [chosenBbox, setChosenBbox] = useState<BBox | null>(null);

  const headerRight = useCallback(
    () => (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.modifyButton}
      >
        <View>
          <Animated.Text
            style={{
              ...styles.modifyButtonText,
              color: colors.link,
            }}
          >
            {t('itineraryScreen.backTitle')}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation, t, styles, colors],
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight });
  }, [navigation, headerRight, t]);

  const filteredPlacesParams = useMemo(
    () => ({
      siteId: campus?.id,
      floorId: floorId,
      startRoom: startRoom,
      destRoom: destRoom,
    }),
    [campus?.id, floorId, startRoom, destRoom],
  );

  const { filteredPlaces: places } = useNavigationPlaces(filteredPlacesParams);

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
  const renderMapContent = useCallback(
    () => (
      <>
        <PathLayer
          handleSegmentChange={setChosenBbox}
          pathFeatureCollection={pathFeat.data.features}
        />
        <MarkersLayer
          places={places}
          //selectedId={selectedId}
          //setSelectedId={setSelectedId}
        />
      </>
    ),
    [places, /*selectedId, setSelectedId,*/ pathFeat],
  );

  useLayoutEffect(() => {
    const isValidGeometry =
      chosenBbox?.length === 4 &&
      chosenBbox.every(
        coord => !isNaN(coord) && typeof coord === 'number' && isFinite(coord),
      );

    if (isValidGeometry) {
      const bounds = {
        ne: [chosenBbox[2], chosenBbox[3]],
        sw: [chosenBbox[0], chosenBbox[1]],
      };

      navigation.setOptions({
        mapOptions: {
          camera: {
            padding: {
              paddingTop: screenHeight * 0.4,
              paddingBottom: 100,
              paddingLeft: 50,
              paddingRight: 50,
            },
            bounds: bounds,
            zoomLevel: 19,
          },
        },
      });
    }
  }, [chosenBbox, navigation, screenHeight]);

  useLayoutEffect(() => {
    navigation.setOptions({
      mapContent: renderMapContent,
    });
  }, [navigation, renderMapContent]);

  useEffect(() => {
    const rootNav = navigation.getParent()!;
    return () => displayTabBar(rootNav);
  }, [navigation]);

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

  useEffect(() => {
    if (selectedLine === 'line-layer-0') {
      const allCoordinates =
        pathFeat?.data.features[0].features.geometry.coordinates.flatMap(
          (coord: any) => coord,
        );
      setFloorId(pathFeat?.data.features[0].features.properties?.fnFlId);
      if (allCoordinates && allCoordinates.length > 0)
        setChosenBbox(
          bbox({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: allCoordinates ? allCoordinates : [],
                },
                properties: {},
              },
            ],
          }),
        );
    }
  }, [selectedLine, pathFeat, setFloorId]);

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

  useScreenTitle(t('itineraryScreen.title'));

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
          <TranslucentCard>
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
        {pathFeat && pathFeat.data.features.length > 0 && selectedLine && (
          <SubPathSelector
            lineId={0}
            pathFeatureCollection={pathFeat.data.features}
          />
        )}
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
    modifyButton: {
      paddingHorizontal: 10,
    },
    modifyButtonText: {
      fontSize: 17,
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
