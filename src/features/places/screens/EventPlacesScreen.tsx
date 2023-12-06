import { useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useHeaderHeight } from '@react-navigation/elements';
import { FillLayer, LineLayer, ShapeSource } from '@rnmapbox/maps';

import { IS_IOS } from '../../../core/constants';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetMultiplePlaces } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { notNullish } from '../../../utils/predicates';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesBottomSheet } from '../components/PlacesBottomSheet';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { getCoordinatesBounds } from '../utils/getCoordinatesBounds';

type Props = MapScreenProps<PlacesStackParamList, 'EventPlaces'>;

/**
 * A screen used to highlight the locations of events that happen in multiple
 * rooms such as first year exams
 */
export const EventPlacesScreen = ({ navigation, route }: Props) => {
  const { palettes } = useTheme();
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const headerHeight = useHeaderHeight();
  const safeAreaInsets = useSafeAreaInsets();
  const { placeIds, eventName } = route.params;
  const placesQueries = useGetMultiplePlaces(placeIds);
  const isLoading = useMemo(
    () => placesQueries.some(q => q.isLoading),
    [placesQueries],
  );
  const places = useMemo(() => {
    if (isLoading) {
      return [];
    }
    return placesQueries.map(q => q.data).filter(notNullish) as Exclude<
      (typeof placesQueries)[number]['data'],
      undefined
    >[];
  }, [isLoading, placesQueries]);
  const floorId = useMemo(() => {
    if (isLoading) {
      return undefined;
    }
    const floorIds = new Set(placesQueries.map(p => p.data?.floor.id));
    return floorIds.size === 1 ? [...floorIds][0] : undefined;
  }, [isLoading, placesQueries]);

  useScreenTitle(eventName);

  useLayoutEffect(() => {
    if (!isLoading) {
      navigation.setOptions({
        mapOptions: {
          compassPosition: IS_IOS
            ? {
                top: headerHeight - safeAreaInsets.top + spacing[2],
                right: spacing[3],
              }
            : undefined,
          camera: {
            bounds: getCoordinatesBounds(
              places.map(place => [place.longitude, place.latitude]),
            ),
            padding: {
              paddingTop: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: Dimensions.get('window').height / 2 - headerHeight,
            },
          },
        },
        mapContent: (
          <>
            <IndoorMapLayer floorId={floorId} />
            <MarkersLayer
              places={placesQueries.map(q => ({ type: 'place', ...q.data! }))}
              categoryId={places[0]?.category?.id}
              subCategoryId={places[0]?.category?.subCategory?.id}
            />
            {places.map(place => {
              if (!place.geoJson) {
                return null;
              }
              return (
                <ShapeSource
                  key={`placeOutline:${place.id}`}
                  id={`placeOutline:${place.id}`}
                  shape={place.geoJson as any} // TODO fix incompatible types
                  existing={false}
                >
                  <LineLayer
                    id={`placeHighlightLine:${place.id}`}
                    aboveLayerID="indoor"
                    style={{
                      lineColor: palettes.secondary[600],
                      lineWidth: 2,
                    }}
                  />
                  <FillLayer
                    id={`placeHighlightFill:${place.id}`}
                    aboveLayerID="indoor"
                    style={{
                      fillColor: `${palettes.secondary[600]}33`,
                    }}
                  />
                </ShapeSource>
              );
            })}
          </>
        ),
      });
    }
  }, [
    floorId,
    headerHeight,
    isLoading,
    navigation,
    palettes.secondary,
    places,
    placesQueries,
    safeAreaInsets.top,
    spacing,
  ]);

  if (isLoading) {
    return (
      <View style={GlobalStyles.grow} pointerEvents="box-none">
        <BottomSheet
          middleSnapPoint={50}
          handleStyle={{ paddingVertical: undefined }}
        >
          <ActivityIndicator style={{ marginVertical: spacing[8] }} />
        </BottomSheet>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <PlacesBottomSheet
        index={1}
        showSearchBar={false}
        isLoading={isLoading}
        listProps={{
          data:
            places.map(place => ({
              title: place.room.name ?? place.category.subCategory.name,
              subtitle: `${place.category.name} - ${place.floor.name}`,
              linkTo: { screen: 'Place', params: { placeId: place.id } },
            })) ?? [],
          ListEmptyComponent: (
            <EmptyState message={t('placesScreen.noPlacesFound')} />
          ),
        }}
      />
    </View>
  );
};
