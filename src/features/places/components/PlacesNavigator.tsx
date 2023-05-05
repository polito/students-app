import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';

import { Divider } from '@lib/ui/components/Divider';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { PlaceCategoryScreen } from '../screens/PlaceCategoryScreen';
import { PlaceScreen } from '../screens/PlaceScreen';
import { PlacesScreen } from '../screens/PlacesScreen';
import { PlacesSearchScreen } from '../screens/PlacesSearchScreen';
import { createMapNavigator } from './MapNavigator';

export type PlacesStackParamList = {
  Places: undefined;
  PlaceCategory: {
    categoryId: string;
  };
  Place: {
    placeId: string;
  };
  PlacesSearch: {
    categoryId?: string;
    siteId?: string;
    floorId?: string;
    buildingId?: string;
  };
  PlaceCategories: undefined;
};

const Map = createMapNavigator<PlacesStackParamList>();

export const PlacesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Map.Navigator
      screenOptions={{
        orientation: 'portrait',
        headerBackTitleVisible: true,
        headerTransparent: true,
        headerBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <TranslucentView />
            <Divider
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
            />
          </View>
        ),
        mapOptions: {
          // mapType: IS_ANDROID ? 'none' : 'standard',
          initialRegion: {
            latitude: 45.06255980528532,
            longitude: 7.662322058238708,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          onRegionChangeComplete(region, details) {
            console.debug(
              'Zoom level',
              Math.round(
                Math.log2(
                  360 *
                    (Dimensions.get('screen').width /
                      256 /
                      region.longitudeDelta),
                ) + 1,
              ),
            );
          },
        },
        // mapDefaultContent: (
        //   <>
        //      <UrlTile
        //       urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        //       shouldReplaceMapContent={true}
        //       maximumZ={20}
        //       tileCachePath={[TemporaryDirectoryPath, 'map-tiles'].join('/')}
        //     / >
        //     <UrlTile
        //       urlTemplate="http://192.168.1.141:3000/{z}/{x}/{y}.png"
        //       tileCachePath={[TemporaryDirectoryPath, 'interior-tiles'].join(
        //         '/',
        //       )}
        //       minimumZ={16}
        //     />
        //   </>
        // ),
        ...titlesStyles(theme),
      }}
    >
      <Map.Screen
        name="Places"
        component={PlacesScreen}
        options={{ title: t('placesScreen.title') }}
      />
      <Map.Screen
        name="PlaceCategory"
        component={PlaceCategoryScreen}
        options={{
          title: t('placeCategoryScreen.title'),
        }}
      />
      <Map.Screen
        name="Place"
        component={PlaceScreen}
        options={{
          title: t('placeScreen.title'),
        }}
      />
      <Map.Screen
        name="PlacesSearch"
        component={PlacesSearchScreen}
        options={{
          title: t('common.search'),
          headerBackTitleVisible: false,
        }}
      />
    </Map.Navigator>
  );
};
