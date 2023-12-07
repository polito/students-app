import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { faClock, faMap } from '@fortawesome/free-regular-svg-icons';
import {
  faBookOpen,
  faBookReader,
  faChalkboardTeacher,
  faChevronDown,
  faCrosshairs,
  faElevator,
  faEllipsis,
  faExpand,
  faMagnifyingGlassLocation,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Divider } from '@lib/ui/components/Divider';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { PillButton } from '@lib/ui/components/PillButton';
import { PillIconButton } from '@lib/ui/components/PillIconButton';
import { Row } from '@lib/ui/components/Row';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { TranslucentCard } from '@lib/ui/components/TranslucentCard';
import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuView } from '@react-native-menu/menu';
import { useHeaderHeight } from '@react-navigation/elements';
import Mapbox, { CameraPadding } from '@rnmapbox/maps';

import { debounce } from 'lodash';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { IS_IOS } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import {
  useGetPlaceCategory,
  useGetPlaceSubCategory,
} from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { darkTheme } from '../../../core/themes/dark';
import { CampusSelector } from '../components/CampusSelector';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlaceCategoriesBottomSheet } from '../components/PlaceCategoriesBottomSheet';
import { PlacesBottomSheet } from '../components/PlacesBottomSheet';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { MapNavigatorContext } from '../contexts/MapNavigatorContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { useGetPlacesFromSearchResult } from '../hooks/useGetPlacesFromSearchResult';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { SearchPlace, isPlace } from '../types';
import { formatPlaceCategory } from '../utils/category';
import { useFormatAgendaItem } from '../utils/formatAgendaItem';

type Props = MapScreenProps<PlacesStackParamList, 'Places'>;

export const PlacesScreen = ({ navigation, route }: Props) => {
  const { categoryId, subCategoryId, bounds } = route.params ?? {};
  const styles = useStylesheet(createStyles);
  const { colors, spacing, fontSizes } = useTheme();
  const { t } = useTranslation();
  const placeCategory = useGetPlaceCategory(categoryId);
  const placeSubCategory = useGetPlaceSubCategory(subCategoryId);
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(false);
  const headerHeight = useHeaderHeight();
  const [tabsHeight, setTabsHeight] = useState(46);
  const campus = useGetCurrentCampus();
  const { placesSearched } = usePreferencesContext();
  const safeAreaInsets = useSafeAreaInsets();
  const { cameraRef } = useContext(MapNavigatorContext);
  const [search, setSearch] = useState('');
  const [floorId, setFloorId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const formatAgendaItem = useFormatAgendaItem();
  const bottomSheetPosition = useSharedValue(0);
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  const {
    data: searchResult,
    isLoading: isLoadingPlaces,
    siteIndexed,
  } = useSearchPlaces({
    siteId: campus?.id,
    search: debouncedSearch,
    floorId,
    categoryId,
    subCategoryId,
  });

  const places = useGetPlacesFromSearchResult(searchResult);

  const categoryFilterName = useMemo(
    () => formatPlaceCategory(placeSubCategory?.name ?? placeCategory?.name),
    [placeCategory, placeSubCategory],
  );

  useScreenTitle(categoryFilterName);

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
    const { latitude, longitude } = campus;
    cameraRef.current.fitBounds(
      [longitude - campus.extent, latitude - campus.extent],
      [longitude + campus.extent, latitude + campus.extent],
      undefined,
      2000,
    );
  }, [cameraRef, campus]);

  useEffect(() => {
    if (campus) {
      if (!floorId && campus.floors?.length) {
        setFloorId(
          campus.floors.find(f => f.id === 'XPTE')?.id ??
            campus.floors.find(f => f.level === 0)?.id ??
            null,
        );
      }
      centerToCurrentCampus();
    }
  }, [campus, centerToCurrentCampus, floorId]);

  const displayFloorId = useMemo(() => {
    if (debouncedSearch) {
      const floorIds = new Set(
        places.filter(p => isPlace(p)).map(p => p.floor.id),
      );
      return floorIds.size === 1 ? [...floorIds][0] : null;
    }
    return floorId;
  }, [debouncedSearch, floorId, places]);

  const categoryFilterActive = categoryId || subCategoryId;

  useLayoutEffect(() => {
    const mapInsetTop =
      headerHeight -
      safeAreaInsets.top +
      (!categoryFilterActive ? tabsHeight : 0);
    navigation.setOptions({
      headerLeft: !categoryFilterActive
        ? () => <HeaderLogo ml={5} />
        : undefined,
      headerRight: () => <CampusSelector />,
      mapOptions: {
        compassPosition: IS_IOS
          ? {
              top: mapInsetTop + spacing[2],
              right: spacing[3],
            }
          : undefined,
        camera: {
          padding: {
            paddingTop: mapInsetTop,
          } as CameraPadding,
          bounds:
            bounds ??
            (campus
              ? {
                  ne: [
                    campus.longitude - campus.extent,
                    campus.latitude - campus.extent,
                  ],
                  sw: [
                    campus.longitude + campus.extent,
                    campus.latitude + campus.extent,
                  ],
                }
              : undefined),
        },
      },
      mapContent: (
        <>
          {displayFloorId != null && (
            <IndoorMapLayer floorId={displayFloorId} />
          )}
          <MarkersLayer
            search={debouncedSearch}
            places={places ?? []}
            displayFloor={!displayFloorId}
            categoryId={categoryId}
            subCategoryId={subCategoryId}
          />
        </>
      ),
    });
    // Including `navigation` here causes a rerender loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bounds,
    campus,
    categoryFilterActive,
    categoryId,
    debouncedSearch,
    displayFloorId,
    headerHeight,
    searchResult,
    safeAreaInsets.top,
    spacing,
    subCategoryId,
    tabsHeight,
  ]);

  const controlsAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      bottomSheetPosition.value,
      [0.65 * screenHeight, 0.7 * screenHeight],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
      transform: [
        {
          translateY: Math.max(0.7 * screenHeight, bottomSheetPosition.value),
        },
      ],
    };
  });

  const listPlaces = useMemo((): SearchPlace[] => {
    if (!debouncedSearch && !categoryId && !subCategoryId) {
      return places.filter(p => isPlace(p) && p.room.name != null);
    }
    return places;
  }, [categoryId, debouncedSearch, places, subCategoryId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSearch = useCallback(
    debounce(() => setDebouncedSearch(search.trim().toLowerCase()), 100, {
      leading: true,
    }),
    [search],
  );

  const floorSelectorButton = (
    <TranslucentCard>
      <TouchableOpacity
        accessibilityLabel={t('placesScreen.changeFloor')}
        disabled={!!debouncedSearch && displayFloorId != null}
      >
        <Row ph={3} pv={2.5} gap={1} align="center">
          <Icon icon={faElevator} />
          <Text>{campus?.floors.find(f => f.id === floorId)?.name}</Text>
          <Icon icon={faChevronDown} size={fontSizes.xs} />
        </Row>
      </TouchableOpacity>
    </TranslucentCard>
  );

  if (!siteIndexed) {
    return (
      <Col flexGrow={1} align="center" justify="center">
        <TranslucentCard ph={6} pv={10}>
          <Col align="center" gap={1}>
            <Icon
              icon={faMap}
              color={colors.secondaryText}
              size={fontSizes['3xl']}
              style={styles.loadingIcon}
            />

            <Text
              style={{ textAlign: 'center', color: colors.secondaryText }}
              variant="heading"
            >
              {t('placesScreen.unwrappingMap')}
            </Text>

            <Text
              style={{ textAlign: 'center', fontSize: fontSizes.xs }}
              variant="secondaryText"
            >
              {t('common.mightTakeAWhile')}
            </Text>
          </Col>
        </TranslucentCard>
      </Col>
    );
  }

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
      {!categoryFilterActive && (
        <Tabs
          style={{
            minWidth: '100%',
          }}
          onLayout={({
            nativeEvent: {
              layout: { height },
            },
          }) => setTabsHeight(height)}
        >
          <PillIconButton
            icon={faClock}
            onPress={() => navigation.navigate('FreeRooms')}
          >
            {t('freeRoomsScreen.title')}
          </PillIconButton>
          <PillIconButton
            icon={faChalkboardTeacher}
            onPress={() =>
              navigation.navigate({
                name: 'Places',
                params: { subCategoryId: 'AULA' },
              })
            }
          >
            {t('placeCategories.classrooms')}
          </PillIconButton>
          <PillIconButton
            icon={faBookReader}
            onPress={() =>
              navigation.navigate({
                name: 'Places',
                params: { subCategoryId: 'S_STUD' },
              })
            }
          >
            {t('placeCategories.studyRooms')}
          </PillIconButton>
          <PillIconButton
            icon={faBookOpen}
            onPress={() =>
              navigation.navigate({
                name: 'Places',
                params: { subCategoryId: 'BIBLIO' },
              })
            }
          >
            {t('placeCategories.libraries')}
          </PillIconButton>
          {/* TODO <PillButton
            onPress={() =>
              navigation.navigate({
                name: 'Places',
                key: 'Places:student',
                params: { categoryId: 'student' },
              })
            }
          >
            Student services
          </PillButton>*/}
          <PillButton onPress={() => setCategoriesPanelOpen(true)}>
            <ThemeContext.Provider value={darkTheme}>
              <Row align="center" gap={2}>
                <Icon icon={faEllipsis} />
                <Text weight="medium">More</Text>
              </Row>
            </ThemeContext.Provider>
          </PillButton>
        </Tabs>
      )}

      <Animated.View style={[styles.controls, controlsAnimatedStyle]}>
        <Row gap={3} align="center" justify="space-between">
          <TranslucentCard>
            <IconButton
              icon={faCrosshairs}
              style={styles.icon}
              accessibilityLabel={t('placesScreen.goToMyPosition')}
              onPress={centerToUserLocation}
            />
            <Divider style={styles.divider} size={1} />
            <IconButton
              icon={faExpand}
              style={styles.icon}
              accessibilityLabel={t('placesScreen.viewWholeCampus')}
              onPress={centerToCurrentCampus}
            />
          </TranslucentCard>

          {campus?.floors?.length ? (
            !debouncedSearch ? (
              <MenuView
                onPressAction={({
                  nativeEvent: { event: selectedFloorId },
                }) => {
                  setFloorId(selectedFloorId);
                }}
                actions={campus.floors
                  .sort((a, b) => a.level - b.level)
                  .map(f => ({
                    id: f.id,
                    title: f.name,
                    subtitle: f.level.toString(),
                  }))}
              >
                {floorSelectorButton}
              </MenuView>
            ) : displayFloorId ? (
              floorSelectorButton
            ) : (
              <TranslucentCard>
                <Row
                  ph={3}
                  pv={2.5}
                  gap={2}
                  align="center"
                  style={{ opacity: 0.6 }}
                >
                  <Icon icon={faElevator} />
                  <Text
                    style={{
                      fontSize: fontSizes['2xs'],
                      maxWidth: 100,
                      marginVertical: -spacing[2.5],
                    }}
                  >
                    {t('placesScreen.multipleFloors')}
                  </Text>
                </Row>
              </TranslucentCard>
            )
          ) : null}
        </Row>
      </Animated.View>

      <PlacesBottomSheet
        index={0}
        animatedPosition={bottomSheetPosition}
        search={search}
        onSearchChange={setSearch}
        onTriggerSearch={triggerSearch}
        searchFieldLabel={[
          t('common.search'),
          categoryFilterName,
          'in',
          campus?.name,
        ]
          .filter(Boolean)
          .join(' ')}
        isLoading={isLoadingPlaces}
        listProps={{
          data:
            listPlaces?.map(p => ({
              title: isPlace(p)
                ? p.room.name ?? p.category.subCategory.name
                : p.name,
              subtitle: isPlace(p)
                ? `${
                    p.agendaItem != null
                      ? formatAgendaItem(p.agendaItem)
                      : placesSearched.some(ps => ps.id === p.id)
                      ? t('common.recentlyViewed')
                      : p.category.name
                  } - ${p.floor.name}`
                : t('common.building'),
              linkTo: isPlace(p)
                ? { screen: 'Place', params: { placeId: p.id } }
                : { screen: 'Building', params: { buildingId: p.id } },
            })) ?? [],
          ListEmptyComponent: (
            <EmptyState
              message={t('placesScreen.noPlacesFound')}
              icon={faMagnifyingGlassLocation}
            />
          ),
        }}
      />

      <PlaceCategoriesBottomSheet
        index={categoriesPanelOpen ? 0 : -1}
        onClose={() => setCategoriesPanelOpen(false)}
      />
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    controls: {
      position: 'absolute',
      top: 0,
      left: spacing[5],
      right: spacing[5],
      marginTop: -58,
    },
    divider: {
      alignSelf: 'stretch',
    },
    loadingIcon: {
      marginBottom: spacing[2],
    },
    icon: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2.5],
    },
  });
