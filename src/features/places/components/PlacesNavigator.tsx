import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageURISource, Platform, StyleSheet, View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';

import { Divider } from '@lib/ui/components/Divider';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PlaceOverview } from '@polito/api-client';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Images,
  RasterLayer,
  RasterSource,
  UserLocation,
} from '@rnmapbox/maps';

import { createHeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogoNoProps } from '../../../core/components/HeaderLogo';
import { TranslucentView } from '../../../core/components/TranslucentView';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { notNullish } from '../../../utils/predicates';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { INTERIORS_MIN_ZOOM, MAX_ZOOM, RASTER_TILE_SIZE } from '../constants';
import { PlacesContext } from '../contexts/PlacesContext';
import { usePlaceCategoriesMap } from '../hooks/usePlaceCategoriesMap';
import { BuildingScreen } from '../screens/BuildingScreen';
import { EventPlacesScreen } from '../screens/EventPlacesScreen';
import { FreeRoomsScreen } from '../screens/FreeRoomsScreen';
import { IndicationsScreen } from '../screens/IndicationsScreen';
import { ItineraryScreen } from '../screens/ItineraryScreen';
import { PlaceScreen } from '../screens/PlaceScreen';
import { PlacesScreen } from '../screens/PlacesScreen';
import { DestinationPlaceType } from '../types';
import { createMapNavigator } from './MapNavigator';

export type ServiceStackParamList = {
  Places: undefined;
  MessagesModal: undefined;
};
const Stack = createNativeStackNavigator<ServiceStackParamList>();

export type PlacesStackParamList = {
  Places: {
    categoryId?: string;
    subCategoryId?: string;
    pitch?: number;
  };
  Place: {
    placeId: string;
    isCrossNavigation?: boolean;
    long?: string | null;
    lat?: string | null;
    name?: string;
  };
  EventPlaces: {
    placeIds: string[];
    eventName?: string;
    isCrossNavigation?: boolean;
  };
  Building: {
    siteId: string;
    buildingId: string;
  };
  Indications: {
    fromPlace?: DestinationPlaceType;
    toPlace?: DestinationPlaceType;
  };
  Itinerary: {
    startRoom: string;
    destRoom: string;
    avoidStairs: boolean;
  };
  PlaceCategories: undefined;
  MessagesModal: undefined;
  FreeRooms: undefined;
};

const Map = createMapNavigator();

const MapDefaultContent = () => {
  const theme = useTheme();
  const colorScheme = useMemo(() => (theme.dark ? 'dark' : 'light'), [theme]);
  const { floorId } = useContext(PlacesContext);
  const categories = usePlaceCategoriesMap();
  const images = useMemo<Record<string, ImageURISource>>(
    () =>
      categories
        ? Object.fromEntries(
            [
              ...new Set(
                Object.values(categories)
                  .map(c => c.markerUrl)
                  .filter(notNullish),
              ),
            ].map(uri => [uri, { uri }]),
          )
        : {},
    [categories],
  );

  return (
    <>
      <UserLocation />

      {/* Marker images */}
      <Images images={images} />

      {/* Outdoor map */}
      <RasterSource
        key={`outdoorSource:${colorScheme}`}
        id="outdoorSource"
        tileUrlTemplates={[
          `https://app.didattica.polito.it/tiles/${colorScheme}/{z}/{x}/{y}.png`,
        ]}
        tileSize={RASTER_TILE_SIZE}
        maxZoomLevel={MAX_ZOOM}
      >
        <RasterLayer
          id="outdoor"
          aboveLayerID="background"
          style={{ rasterOpacity: 1 }}
        />
      </RasterSource>

      {/* Indoor map */}
      <RasterSource
        key={`indoorSource:${colorScheme}:${floorId}`}
        id="indoorSource"
        tileUrlTemplates={[
          `https://app.didattica.polito.it/tiles/int-${colorScheme}-${floorId?.toLowerCase()}/{z}/{x}/{y}.png`,
        ]}
        tileSize={RASTER_TILE_SIZE}
        minZoomLevel={INTERIORS_MIN_ZOOM}
        maxZoomLevel={MAX_ZOOM}
      >
        <RasterLayer
          id="indoor"
          aboveLayerID="outdoor"
          style={{ rasterOpacity: 1 }}
        />
      </RasterSource>
    </>
  );
};

export const PlacesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [floorId, setFloorId] = useState<string>();
  const [lines, setLines] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>();
  const [itineraryMode, setItineraryMode] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceOverview | null>(
    null,
  );
  const [selectionIcon, setSelectionIcon] = useState<string | null>(null);

  const checkAndSetFloorId = (id?: string) => {
    if (id) {
      setFloorId(id);
    }
  };

  const handleSelectSegment = (label: string, floor: string) => {
    const lineLayer = label;

    if (selectedLine === lineLayer) {
      setLine(undefined);
    } else {
      setLine(lineLayer);
      checkAndSetFloorId(floor);
    }
  };

  const handleSelectedPlace = (place: PlaceOverview | null) => {
    if (place) {
      setSelectedPlace(place);
    } else setSelectedPlace(null);
  };

  const setAllLines = (line: string) => {
    setLines(prev => {
      if (prev.length > 0) return [...prev, line];
      else return [line];
    });
  };

  const setLine = (line?: string) => {
    setSelectedLine(line);
  };

  const setMode = (mode?: boolean) => {
    if (mode !== undefined) {
      setItineraryMode(mode);
    } else {
      setItineraryMode(false);
    }
  };

  useEffect(() => {
    const perm = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });
    if (perm) request(perm).catch(console.error);
    setMode(false);
  }, []);

  return (
    <PlacesContext.Provider
      value={{
        floorId,
        setFloorId: checkAndSetFloorId,
        lines,
        setLines: setAllLines,
        selectedLine,
        setSelectedLine: setLine,
        itineraryMode,
        setItineraryMode: setMode,
        handleSelectSegment: handleSelectSegment,
        selectedPlace: selectedPlace,
        setSelectedPlace: handleSelectedPlace,
        selectionIcon: selectionIcon,
        setSelectionIcon: setSelectionIcon,
      }}
    >
      <Map.Navigator
        id="PlacesTabNavigator"
        screenOptions={{
          orientation: 'portrait',
          headerBackButtonDisplayMode: 'default',
          headerTransparent: true,
          headerBackground: () => (
            <View style={StyleSheet.absoluteFill}>
              <TranslucentView fallbackOpacity={1} />
              <Divider
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
              />
            </View>
          ),
          mapDefaultOptions: {
            camera: {
              animationDuration: 2000,
              animationMode: 'flyTo',
              maxZoomLevel: MAX_ZOOM,
            },
            attributionEnabled: false,
            compassEnabled: false,
            styleJSON: JSON.stringify({
              version: 8,
              glyphs:
                'https://app.didattica.polito.it/maps_fonts/{fontstack}/{range}.pbf',
              sources: {},
              layers: [],
            }),
          },
          mapDefaultContent: MapDefaultContent,
          ...useTitlesStyles(theme),
        }}
      >
        <Map.Screen
          name="Places"
          component={PlacesScreen}
          options={{ title: t('placesScreen.title') }}
          getId={({ params }: { params: any }) =>
            [params?.categoryId, params?.subCategoryId].join()
          }
        />
        <Map.Screen
          name="Place"
          component={PlaceScreen}
          options={{
            title: t('placeScreen.title'),
          }}
        />
        <Map.Screen
          name="EventPlaces"
          component={EventPlacesScreen}
          options={{
            title: t('eventPlacesScreen.title'),
          }}
        />
        <Map.Screen
          name="Building"
          component={BuildingScreen}
          options={{
            title: t('common.building'),
          }}
        />
        <Stack.Screen
          name="MessagesModal"
          component={UnreadMessagesModal}
          options={({ navigation }) => ({
            headerTitle: t('messagesScreen.title'),
            headerLargeTitle: false,
            presentation: 'modal',
            headerLeft: HeaderLogoNoProps,
            headerRight: createHeaderCloseButton(navigation),
          })}
        />
        <Map.Screen
          name="Indications"
          component={IndicationsScreen}
          options={{
            title: t('indicationsScreen.title'),
          }}
        />
        <Map.Screen
          name="Itinerary"
          component={ItineraryScreen}
          options={{
            title: t('itineraryScreen.title'),
          }}
        />
        <Map.Screen
          name="FreeRooms"
          component={FreeRoomsScreen}
          options={{
            title: t('freeRoomsScreen.title'),
          }}
        />
      </Map.Navigator>
    </PlacesContext.Provider>
  );
};
