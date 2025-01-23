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

import { faClock } from '@fortawesome/free-regular-svg-icons';
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
import { Divider } from '@lib/ui/components/Divider';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { PillButton } from '@lib/ui/components/PillButton';
import { PillIconButton } from '@lib/ui/components/PillIconButton';
import { Row } from '@lib/ui/components/Row';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { TranslucentCard } from '@lib/ui/components/TranslucentCard';
import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { PlaceOverview } from '@polito/api-client';
import { useHeaderHeight } from '@react-navigation/elements';
import Mapbox, { CameraPadding } from '@rnmapbox/maps';

import { debounce } from 'lodash';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import {
  useGetPlaceCategory,
  useGetPlaceSubCategory,
} from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { darkTheme } from '../../../core/themes/dark';
import { CampusSelector } from '../components/CampusSelector';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlaceCategoriesBottomSheet } from '../components/PlaceCategoriesBottomSheet';
import { PlacesBottomSheet } from '../components/PlacesBottomSheet';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { MapNavigatorContext } from '../contexts/MapNavigatorContext';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { useSearchPlaceToListItem } from '../hooks/useSearchPlaceToListItem';
import { useSearchPlaces } from '../hooks/useSearchPlaces';
import { SearchPlace, isPlace } from '../types';
import { formatPlaceCategory } from '../utils/category';

type Props = MapScreenProps<PlacesStackParamList, 'Places'>;

export const PlacesScreen = ({ navigation, route }: Props) => {
  const { categoryId, subCategoryId } = route.params ?? {};
  const styles = useStylesheet(createStyles);
  const { spacing, fontSizes } = useTheme();
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
  const { floorId: mapFloorId, setFloorId: setMapFloorId } =
    useContext(PlacesContext);
  const searchPlaceToListItem = useSearchPlaceToListItem();
  const [search, setSearch] = useState('');
  const [floorId, setFloorId] = useState<string>();
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const bottomSheetPosition = useSharedValue(0);
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  const { data: places, isLoading: isLoadingPlaces } = useSearchPlaces({
    siteId: campus?.id,
    search: debouncedSearch,
    floorId,
    categoryId,
    subCategoryId,
  });

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
            campus.floors.find(f => f.level === 0)?.id,
        );
      }
      centerToCurrentCampus();
    }
  }, [campus, centerToCurrentCampus, floorId]);

  const displayFloorId = useMemo(() => {
    if (debouncedSearch) {
      const floorIds = new Set(
        (places.filter(p => isPlace(p)) as PlaceOverview[]).map(
          p => p.floor.id,
        ),
      );
      return floorIds.size === 1 ? [...floorIds][0] : undefined;
    }
    return floorId;
  }, [debouncedSearch, floorId, places]);

  useEffect(() => {
    if (!isLoadingPlaces && mapFloorId !== floorId) {
      setMapFloorId(displayFloorId);
    }
  }, [displayFloorId, floorId, isLoadingPlaces, mapFloorId, setMapFloorId]);

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
        camera: {
          padding: {
            paddingTop: mapInsetTop,
          } as CameraPadding,
          bounds: campus
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
            : undefined,
        },
      },
      mapContent: () => (
        <MarkersLayer
          search={debouncedSearch}
          places={places ?? []}
          displayFloor={!displayFloorId}
          categoryId={categoryId}
          subCategoryId={subCategoryId}
        />
      ),
    });
    // Including `navigation` here causes a rerender loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    campus,
    categoryFilterActive,
    categoryId,
    debouncedSearch,
    displayFloorId,
    headerHeight,
    places,
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

  const listItems = useMemo(
    () =>
      listPlaces?.map(p =>
        searchPlaceToListItem(
          p,
          placesSearched.some(ps => ps.id === p.id),
        ),
      ) ?? [],
    [listPlaces, placesSearched, searchPlaceToListItem],
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
        <Row gap={3} align="stretch" justify="space-between">
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
              <StatefulMenuView
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
                  }))}
              >
                {floorSelectorButton}
              </StatefulMenuView>
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
        onSearchTrigger={triggerSearch}
        onSearchClear={() => {
          setSearch('');
          setDebouncedSearch('');
        }}
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
          data: listItems,
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
      alignItems: 'center',
      paddingHorizontal: spacing[3],
    },
  });
