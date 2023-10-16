import { useLayoutEffect } from 'react';
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

import { IS_IOS } from '../../../core/constants';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetBuilding, useGetSite } from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { formatPlaceCategory } from '../utils/category';

type Props = MapScreenProps<PlacesStackParamList, 'Building'>;

export const BuildingScreen = ({ navigation, route }: Props) => {
  const { palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { fontSizes, spacing } = useTheme();
  const headerHeight = useHeaderHeight();
  const safeAreaInsets = useSafeAreaInsets();
  const { buildingId } = route.params;
  const {
    data: building,
    isLoading: isLoadingBuilding,
    error: getBuildingError,
  } = useGetBuilding(buildingId);
  const siteId = building?.siteId;
  const site = useGetSite(siteId);
  const { places, isLoading: isLoadingPlaces } = useSearchPlaces({
    siteId,
  });
  const isLoading = isLoadingBuilding || isLoadingPlaces;
  const placeName = building?.name ?? t('common.untitled');

  useScreenTitle(
    (getBuildingError as ResponseError)?.response?.status === 404
      ? t('common.notFound')
      : placeName,
  );

  useLayoutEffect(() => {
    if (building) {
      const { latitude, longitude } = building;
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
            <IndoorMapLayer />
            <MarkersLayer selectedPoiId={buildingId} places={places} />
            {building?.geoJson != null && (
              <ShapeSource
                id="placeHighlightSource"
                shape={building?.geoJson as any} // TODO fix incompatible types
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
    building,
    buildingId,
    headerHeight,
    navigation,
    palettes.secondary,
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
    getBuildingError &&
    (getBuildingError as ResponseError).response.status === 404
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

  if (!building) {
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
            <Text>{site?.name}</Text>
            <Text variant="caption" style={{ textTransform: 'capitalize' }}>
              {formatPlaceCategory(building?.category.name)}
            </Text>
          </Col>

          <Section>
            <SectionHeader title="Location" separator={false} />
            <OverviewList translucent>
              <ListItem
                inverted
                multilineTitle
                title={site?.name ?? '--'}
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
                        building?.latitude,
                        building?.longitude,
                      ].join(',');
                      const label = building?.name;
                      const url = Platform.select({
                        ios: `${scheme}${label}@${latLng}`,
                        android: `${scheme}${latLng}(${label})`,
                      })!;
                      Linking.openURL(url);
                    }}
                  />
                }
              />
            </OverviewList>
          </Section>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const createStyles = ({ fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
    },
  });
