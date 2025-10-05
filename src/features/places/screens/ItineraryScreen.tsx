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
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { SubPathSelector } from '~/features/places/components/SubPathSelector';
import { displayTabBar } from '~/utils/tab-bar';
import { useGetPath } from '~/core/queries/placesHooks';

type Props = MapScreenProps<PlacesStackParamList, 'Itinerary'>;

export const ItineraryScreen = ({ navigation }: Props) => {
    const styles = useStylesheet(createStyles);
    const { spacing } = useTheme();
    const { t } = useTranslation();
    const campus = useGetCurrentCampus();
    const { cameraRef } = useContext(MapNavigatorContext);
    const { selectedLine, setSelectedLine } = useContext(PlacesContext);
   // const searchPlaceToListItem = useSearchPlaceToListItem();
    const [search] = useState('');
    const { floorId: floorId, setFloorId: setFloorId } =        //useful to set the map tot the corrrect floor whenever the user click to that portion of the path
    useContext(PlacesContext);
    const [debouncedSearch] = useState(search);
    const bottomSheetPosition = useSharedValue(0);
    const [screenHeight, setScreenHeight] = useState(
        Dimensions.get('window').height,
    );

    const pathFeatureCollection = useGetPath().features;        //da sostituire con useMemo

    const { data: places } = useSearchPlaces({
        siteId: campus?.id,
        search: debouncedSearch,
        floorId: floorId === 'XPTE' ? undefined : floorId, //perchè se no mi esclude tutti i posti di XPTE
    });

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
            <MarkersLayer 
                places={places}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
            />
            <PathLayer/>
        </>
        ),
        [
        debouncedSearch,
        places,
        ],
    );
    useLayoutEffect(() => {
        navigation.setOptions({
        mapContent: renderMapContent,
        });
    }, [
        debouncedSearch,
        navigation,
        renderMapContent,
    ]);

    useEffect(() => {
      const rootNav = navigation.getParent()!;
      return () => displayTabBar(rootNav);
    }, [navigation]);

    useEffect(() => {
      if(pathFeatureCollection && pathFeatureCollection.length > 0){
        setSelectedLine(`line-layer-0`);
        setFloorId(pathFeatureCollection[0].features.properties.fn_fl_id);
      }
    }, [pathFeatureCollection]);

    const controlsAnimatedStyle = useAnimatedStyle(() => {
        return {
        opacity: 1,
        transform: [
            {
            translateY: Math.max(0.7 * screenHeight, bottomSheetPosition.value),
            },
        ],
        };
    });

    useEffect(() => {
        if (campus)
        setFloorId(campus.floors[campus?.floors.findIndex(f => f.level >= 0)].id);
    }, [campus]);

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

