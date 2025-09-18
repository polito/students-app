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
import { Row } from '@lib/ui/components/Row';
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
import { SubPathSelector } from '~/core/components/SubPathSelector';
import { StatisticsContainer } from '~/core/components/StatisticsContainer';
import { PathSearchBar } from '~/core/components/PathSearchBar';

type Props = MapScreenProps<PlacesStackParamList, 'Itinerary'>;

export const ItineraryScreen = ({ navigation }: Props) => {
    const styles = useStylesheet(createStyles);
    const { spacing } = useTheme();
    const { t } = useTranslation();
    const campus = useGetCurrentCampus();
    const { cameraRef } = useContext(MapNavigatorContext);
   // const searchPlaceToListItem = useSearchPlaceToListItem();
    const [search] = useState('');
    const { floorId: floorId, setFloorId: setFloorId } =        //useful to set the map tot the corrrect floor whenever the user click to that portion of the path
    useContext(PlacesContext);
    const [debouncedSearch] = useState(search);
    const bottomSheetPosition = useSharedValue(0);
    const [screenHeight, setScreenHeight] = useState(
        Dimensions.get('window').height,
    );

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
        places              //i places si aggiornano in base al piano che selezioni
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
          <View style={styles.pathInfo}>
            <StatisticsContainer/>
            <PathSearchBar/>
          </View>
          <Animated.View style={[styles.controls, controlsAnimatedStyle]}>
            <Row gap={3} align="stretch" justify="space-between">
              <TranslucentCard
                style={styles.translucentCard}
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
            </Row>
            <SubPathSelector/>
          </Animated.View>
        </View>
      );
};
    
const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    pathInfo: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 18,
      paddingHorizontal: 18,
      paddingTop: 18,
      position: 'absolute',
      alignSelf: 'stretch',
    },
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
    translucentCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
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

