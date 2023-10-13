/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';

import { Divider } from '@lib/ui/components/Divider';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  MapState,
  RasterLayer,
  RasterSource,
  UserLocation,
} from '@rnmapbox/maps';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { TranslucentView } from '../../../core/components/TranslucentView';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { MAX_ZOOM } from '../constants';
import { FreeRoomsScreen } from '../screens/FreeRoomsScreen';
import { PlaceScreen } from '../screens/PlaceScreen';
import { PlacesScreen } from '../screens/PlacesScreen';
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
    bounds?: MapState['properties']['bounds'];
  };
  Place: {
    placeId: string;
  };
  Building: {
    buildingId: string;
  };
  PlaceCategories: undefined;
  MessagesModal: undefined;
  FreeRooms: undefined;
};

const Map = createMapNavigator<PlacesStackParamList>();

export const PlacesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorScheme = useMemo(() => (theme.dark ? 'dark' : 'light'), [theme]);

  useEffect(() => {
    request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  }, []);

  return (
    <Map.Navigator
      screenOptions={{
        orientation: 'portrait',
        headerBackTitleVisible: true,
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
          compassEnabled: true,
          compassFadeWhenNorth: true,
          styleJSON:
            '{"version":8,"sources":{},"layers":[],"glyphs":"mapbox://fonts/mapbox/{fontstack}/{range}.pbf"}',
        },
        mapDefaultContent: (
          <>
            <UserLocation />
            <RasterSource
              key={`outdoorSource:${colorScheme}`}
              tileUrlTemplates={[
                `https://app.didattica.polito.it/tiles/${colorScheme}/{z}/{x}/{y}.png`,
              ]}
              tileSize={256}
              maxZoomLevel={MAX_ZOOM}
              id="outdoorSource"
              existing={false}
            >
              <RasterLayer style={null} id="outdoor" />
            </RasterSource>
          </>
        ),
        ...useTitlesStyles(theme),
      }}
    >
      <Map.Screen
        name="Places"
        component={PlacesScreen}
        options={{ title: t('placesScreen.title') }}
      />
      <Map.Screen
        name="Place"
        component={PlaceScreen}
        options={{
          title: t('placeScreen.title'),
        }}
      />
      {/* <Map.Screen*/}
      {/*  name="Building"*/}
      {/*  component={BuildingScreen}*/}
      {/*  options={{*/}
      {/*    title: t('common.building'),*/}
      {/*  }}*/}
      {/*/ >*/}
      <Stack.Screen
        name="MessagesModal"
        component={UnreadMessagesModal}
        options={{
          headerTitle: t('messagesScreen.title'),
          headerLargeTitle: false,
          presentation: 'modal',
          headerLeft: () => <HeaderLogo />,
          headerRight: () => <HeaderCloseButton />,
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
  );
};
