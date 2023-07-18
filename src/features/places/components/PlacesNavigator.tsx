/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';

import { Divider } from '@lib/ui/components/Divider';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { RasterLayer, RasterSource, UserLocation } from '@rnmapbox/maps';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { MAX_ZOOM } from '../constants';
import { PlacesContext } from '../contexts/PlacesContext';
import { PlaceScreen } from '../screens/PlaceScreen';
import { PlacesScreen } from '../screens/PlacesScreen';
import { createMapNavigator } from './MapNavigator';

export type PlacesStackParamList = {
  Places: {
    categoryId?: string;
  };
  Place: {
    placeId: string;
  };
  PlaceCategories: undefined;
};

const Map = createMapNavigator<PlacesStackParamList>();

export const PlacesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorScheme = useMemo(() => (theme.dark ? 'dark' : 'light'), [theme]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  }, []);

  return (
    <PlacesContext.Provider value={{ search, setSearch }}>
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
      </Map.Navigator>
    </PlacesContext.Provider>
  );
};
