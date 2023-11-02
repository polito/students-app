import { useEffect, useLayoutEffect, useState } from 'react';
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
import { FillLayer, LineLayer, ShapeSource } from '@rnmapbox/maps';

import { capitalize } from 'lodash';

import { IS_IOS, MAX_RECENT_SEARCHES } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetPlace } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { setCustomBackHandler } from '../../../utils/navigation';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { formatPlaceCategory } from '../utils/category';

type Props = MapScreenProps<PlacesStackParamList, 'Place'>;

export const PlaceScreen = ({ navigation, route }: Props) => {
  const { palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { placesSearched, updatePreference } = usePreferencesContext();
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
  const siteId = place?.data.site.id;
  const floorId = place?.data.floor.id;
  const { places, isLoading: isLoadingPlaces } = useSearchPlaces({
    siteId,
    floorId,
  });
  const isLoading = isLoadingPlace || isLoadingPlaces;
  const placeName =
    place?.data.room.name ??
    place?.data.category.subCategory.name ??
    t('common.untitled');

  useScreenTitle(
    (getPlaceError as ResponseError)?.response?.status === 404
      ? t('common.notFound')
      : capitalize(placeName),
  );

  useEffect(() => {
    if (place?.data && !updatedRecentPlaces) {
      updatePreference('placesSearched', [
        place.data,
        ...placesSearched
          .filter(p => p.id !== place.data.id)
          .slice(0, MAX_RECENT_SEARCHES - 1),
      ]);
      setUpdatedRecentPlaces(true);
    }
  }, [place?.data, placesSearched, updatePreference, updatedRecentPlaces]);

  useLayoutEffect(() => {
    if (place?.data) {
      const { latitude, longitude } = place.data;
      navigation.setOptions({
        mapOptions: {
          compassPosition: IS_IOS
            ? {
                top: headerHeight - safeAreaInsets.top + spacing[2],
                right: spacing[3],
              }
            : undefined,
          camera: {
            centerCoordinate: [longitude, latitude],
            padding: {
              paddingTop: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: Dimensions.get('window').height / 2 - headerHeight,
            },
            zoomLevel: 19,
          },
        },
        mapContent: (
          <>
            <IndoorMapLayer floorId={floorId} />
            <MarkersLayer
              selectedPoiId={placeId}
              places={places}
              categoryId={place.data?.category?.id}
              subCategoryId={place.data?.category?.subCategory?.id}
            />
            {place.data.geoJson != null && (
              <ShapeSource
                id="placeHighlightSource"
                shape={place.data.geoJson as any} // TODO fix incompatible types
                existing={false}
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
  }, [
    floorId,
    headerHeight,
    navigation,
    palettes.secondary,
    place?.data,
    placeId,
    places,
    safeAreaInsets.top,
    spacing,
  ]);

  useEffect(() => {
    setCustomBackHandler(navigation, isCrossNavigation ?? false);
  }, [isCrossNavigation, navigation]);

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
    getPlaceError &&
    (getPlaceError as ResponseError).response.status === 404
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

  if (!place) {
    return null;
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
            <Text>{place.data.site.name}</Text>
            <Text variant="caption" style={{ textTransform: 'capitalize' }}>
              {formatPlaceCategory(place.data.category.name)}
            </Text>
          </Col>

          {/* {(place.data.category.id === 'AULA' ||*/}
          {/*  place.data.category.id === 'LAB') && (*/}
          {/*  <Section>*/}
          {/*    <SectionHeader*/}
          {/*      title={`${placeName} ${t('common.inYourAgenda')}`}*/}
          {/*      separator={false}*/}
          {/*    />*/}
          {/*    <OverviewList translucent>*/}
          {/*      <Col p={5}>*/}
          {/*        <Text>Coming soon</Text>*/}
          {/*      </Col>*/}
          {/*    </OverviewList>*/}
          {/*  </Section>*/}
          {/* )}*/}

          <Section>
            <SectionHeader title="Location" separator={false} />
            <OverviewList translucent>
              <ListItem
                inverted
                multilineTitle
                title={place.data.site.name}
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
                      const latLng = [
                        place?.data.latitude,
                        place?.data.longitude,
                      ].join(',');
                      const label = place?.data.room.name;
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
                title={place.data.building.name}
                subtitle={t('common.building')}
              />
              <ListItem
                inverted
                title={`${place.data.floor.level} - ${place.data.floor.name}`}
                subtitle={t('common.floor')}
              />
              {place.data.structure && (
                <ListItem
                  inverted
                  multilineTitle
                  title={place.data.structure?.name}
                  subtitle={t('common.structure')}
                />
              )}
              {/* <ListItem*/}
              {/*  inverted*/}
              {/*  isAction*/}
              {/*  titleProps={{*/}
              {/*    numberOfLines: undefined,*/}
              {/*    ellipsizeMode: undefined,*/}
              {/*  }}*/}
              {/*  title="Sede Centrale - Cittadella Politecnica"*/}
              {/*  subtitle="Campus"*/}
              {/*/ >*/}
            </OverviewList>
          </Section>

          {(place.data.capacity > 0 || place.data.resources?.length > 0) && (
            <Section>
              <SectionHeader title={t('common.facilities')} separator={false} />
              <OverviewList translucent>
                {place.data.capacity > 0 && (
                  <ListItem
                    inverted
                    title={t('placeScreen.capacity', {
                      count: place.data.capacity,
                    })}
                    subtitle={t('common.capacity')}
                  />
                )}
                {place.data.resources?.map(r => (
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
