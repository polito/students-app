import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Linking, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faDiamondTurnRight,
  faSignsPost,
} from '@fortawesome/free-solid-svg-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { Col } from '@lib/ui/components/Col';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { ResponseError } from '@polito/api-client/runtime';
import { useHeaderHeight } from '@react-navigation/elements';
import { CameraBounds, CameraPadding } from '@rnmapbox/maps';
import { FillLayer, LineLayer, ShapeSource } from '@rnmapbox/maps';

import { Polygon } from 'geojson';
import { capitalize } from 'lodash';

import { MAX_RECENT_SEARCHES } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetPlace } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { PlacesContext } from '../contexts/PlacesContext';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { formatPlaceCategory } from '../utils/category';
import { getCoordinatesBounds } from '../utils/getCoordinatesBounds';

type Props = MapScreenProps<PlacesStackParamList, 'Place'>;

export const PlaceScreen = ({ navigation, route }: Props) => {
  const { palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { placesSearched, updatePreference } = usePreferencesContext();
  const { floorId, setFloorId } = useContext(PlacesContext);
  const { fontSizes, spacing } = useTheme();
  const headerHeight = useHeaderHeight();
  const safeAreaInsets = useSafeAreaInsets();
  const { placeId, isCrossNavigation } = route.params;
  const {
    data: place,
    isLoading: isLoadingPlace,
    error: getPlaceError,
  } = useGetPlace(placeId);
  const [updatedRecentPlaces, setUpdatedRecentPlaces] = useState(false);
  const siteId = place?.site.id;
  const placeFloorId = place?.floor.id;
  const { data: places, isLoading: isLoadingPlaces } = useSearchPlaces({
    siteId,
    floorId: placeFloorId,
  });

  useEffect(() => {
    if (!isLoadingPlace && placeFloorId !== floorId) {
      setFloorId(placeFloorId);
    }
  }, [floorId, isLoadingPlace, placeFloorId, setFloorId]);

  const isLoading = isLoadingPlace || isLoadingPlaces;
  const placeName =
    place?.room.name ??
    place?.category.subCategory?.name ??
    t('common.untitled');

  useScreenTitle(
    (getPlaceError as ResponseError)?.response?.status === 404
      ? t('common.notFound')
      : capitalize(placeName),
  );

  useEffect(() => {
    if (isCrossNavigation) {
      navigation.setOptions({ headerShown: false });
      navigation.getParent()?.setOptions({ title: placeName });
    }
  }, [navigation, t, placeName, isCrossNavigation]);

  useEffect(() => {
    if (place && !updatedRecentPlaces) {
      updatePreference('placesSearched', [
        place,
        ...placesSearched
          .filter(p => p.id !== place.id)
          .slice(0, MAX_RECENT_SEARCHES - 1),
      ]);
      setUpdatedRecentPlaces(true);
    }
  }, [place, placesSearched, updatePreference, updatedRecentPlaces]);

  useLayoutEffect(() => {
    if (place) {
      const { latitude, longitude } = place;
      const bounds: CameraPadding & Partial<CameraBounds> = {
        paddingTop: headerHeight,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: Dimensions.get('window').height / 2 - headerHeight,
      };
      if (place.geoJson?.geometry.type === 'Polygon') {
        const coordinates = (place.geoJson.geometry as Polygon).coordinates;
        if (coordinates?.length > 0) {
          const { sw, ne } = getCoordinatesBounds(
            coordinates.flat() as unknown as [number, number][],
          );
          bounds.sw = sw;
          bounds.ne = ne;
        }
      }
      navigation.setOptions({
        mapOptions: {
          camera: {
            centerCoordinate: bounds.sw ? undefined : [longitude, latitude],
            padding: bounds.sw ? undefined : bounds,
            bounds: bounds.sw ? (bounds as CameraBounds) : undefined,
            zoomLevel: bounds.sw ? undefined : 19,
          },
        },
        mapContent: () => (
          <>
            <MarkersLayer
              selectedPoiId={placeId}
              places={places}
              categoryId={place?.category?.id}
              subCategoryId={place?.category?.subCategory?.id}
              isCrossNavigation={isCrossNavigation}
            />
            {place.geoJson != null && (
              <ShapeSource
                id="placeHighlightSource"
                shape={place.geoJson as any} // TODO fix incompatible types
              >
                <LineLayer
                  id="placeHighlightLine"
                  aboveLayerID="indoor"
                  style={{
                    lineColor: palettes.secondary[600],
                    lineWidth: 2,
                  }}
                />
                <FillLayer
                  id="placeHighlightFill"
                  aboveLayerID="indoor"
                  style={{
                    fillColor: `${palettes.secondary[600]}33`,
                  }}
                />
              </ShapeSource>
            )}
          </>
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    placeFloorId,
    isCrossNavigation,
    headerHeight,
    navigation,
    palettes.secondary,
    place,
    placeId,
    places,
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

  if (
    !place ||
    (getPlaceError &&
      (getPlaceError as ResponseError)?.response?.status === 404)
  ) {
    return (
      <View style={GlobalStyles.grow} pointerEvents="box-none">
        <BottomSheet
          middleSnapPoint={50}
          handleStyle={{ paddingVertical: undefined }}
        >
          <EmptyState
            message={t('placeScreen.placeNotFound')}
            icon={faSignsPost}
          />
        </BottomSheet>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <BottomSheet
        middleSnapPoint={50}
        handleStyle={{ paddingVertical: undefined }}
      >
        <BottomSheetScrollView>
          <Col ph={5} mb={5}>
            <Text variant="title" style={styles.title}>
              {placeName}
            </Text>
            <Text>{place.site.name}</Text>
            <Text variant="caption" style={{ textTransform: 'capitalize' }}>
              {formatPlaceCategory(place.category.name)}
            </Text>
          </Col>

          <Section>
            <SectionHeader title="Location" separator={false} />
            <OverviewList translucent>
              <ListItem
                inverted
                multilineTitle
                title={place.site.name}
                subtitle={t('common.campus')}
                trailingItem={
                  <IconButton
                    icon={faDiamondTurnRight}
                    size={fontSizes.xl}
                    adjustSpacing="right"
                    accessibilityLabel={t('common.navigate')}
                    onPress={() => {
                      const scheme = Platform.select({
                        ios: 'maps://0,0?q=',
                        android: 'geo:0,0?q=',
                      });
                      const latLng = [place?.latitude, place?.longitude].join(
                        ',',
                      );
                      const label = place?.room.name;
                      const url = Platform.select({
                        ios: `${scheme}${label}@${latLng}`,
                        android: `${scheme}${latLng}(${label})`,
                      })!;
                      Linking.openURL(url);
                    }}
                  />
                }
              />
              <ListItem
                inverted
                title={place.building.name}
                subtitle={t('common.building')}
              />
              <ListItem
                inverted
                title={`${place.floor.level} - ${place.floor.name}`}
                subtitle={t('common.floor')}
              />
              {place.structure && (
                <ListItem
                  inverted
                  multilineTitle
                  title={place.structure?.name}
                  subtitle={t('common.structure')}
                />
              )}
            </OverviewList>
          </Section>

          {(place.capacity > 0 || place.resources?.length > 0) && (
            <Section>
              <SectionHeader title={t('common.facilities')} separator={false} />
              <OverviewList translucent>
                {place.capacity > 0 && (
                  <ListItem
                    inverted
                    title={t('placeScreen.capacity', {
                      count: place.capacity,
                    })}
                    subtitle={t('common.capacity')}
                  />
                )}
                {place.resources?.map(r => (
                  <ListItem
                    key={r.name}
                    inverted
                    multilineTitle
                    title={r.description}
                    subtitle={r.name}
                  />
                ))}
              </OverviewList>
            </Section>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const createStyles = ({ fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
      textTransform: 'capitalize',
    },
  });
