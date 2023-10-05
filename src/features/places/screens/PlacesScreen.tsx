import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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

import {
  faBookOpen,
  faBookReader,
  faChalkboardTeacher,
  faChevronDown,
  faCrosshairs,
  faElevator,
  faEllipsis,
  faExpand,
} from '@fortawesome/free-solid-svg-icons';
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
import { DateTime } from 'luxon';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { IS_IOS } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import {
  useGetPlaceCategory,
  useGetPlaceSubCategory,
  useGetPlaces,
} from '../../../core/queries/placesHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { darkTheme } from '../../../core/themes/dark';
import { useGetAgendaWeeks } from '../../agenda/queries/agendaHooks';
import { LectureItem } from '../../agenda/types/AgendaItem';
import { CampusSelector } from '../components/CampusSelector';
import { IndoorMapLayer } from '../components/IndoorMapLayer';
import { MapScreenProps } from '../components/MapNavigator';
import { MarkersLayer } from '../components/MarkersLayer';
import { PlaceCategoriesBottomSheet } from '../components/PlaceCategoriesBottomSheet';
import { PlacesBottomSheet } from '../components/PlacesBottomSheet';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { UPCOMING_COMMITMENT_HOURS_OFFSET } from '../constants';
import { MapNavigatorContext } from '../contexts/MapNavigatorContext';
import { useGetCurrentCampus } from '../hooks/useGetCurrentCampus';
import { PlaceOverviewWithMetadata } from '../types';
import { formatPlaceCategory } from '../utils/category';
import { formatAgendaItem } from '../utils/formatAgendaItem';
import { resolvePlaceId } from '../utils/resolvePlaceId';

type Props = MapScreenProps<PlacesStackParamList, 'Places'>;

export const PlacesScreen = ({ navigation, route }: Props) => {
  const { categoryId, subCategoryId, pitch, bounds } = route.params ?? {};
  const placeCategory = useGetPlaceCategory(categoryId);
  const placeSubCategory = useGetPlaceSubCategory(subCategoryId);
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { spacing, fontSizes } = useTheme();
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(false);
  const headerHeight = useHeaderHeight();
  const [tabsHeight, setTabsHeight] = useState(46);
  const campus = useGetCurrentCampus();
  const { updatePreference, placesSearched } = usePreferencesContext();
  const safeAreaInsets = useSafeAreaInsets();
  const { cameraRef } = useContext(MapNavigatorContext);
  const [search, setSearch] = useState('');
  const [floorId, setFloorId] = useState<string>();
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const bottomSheetPosition = useSharedValue(0);
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateDebouncedSearch = useCallback(
    debounce((newSearch: string) => setDebouncedSearch(newSearch), 200),
    [],
  );

  useEffect(() => {
    updateDebouncedSearch(search);
  }, [search, updateDebouncedSearch]);

  const { data: places, isLoading: isLoadingPlaces } = useGetPlaces({
    search: debouncedSearch || undefined,
    siteId: campus?.id,
    floorId: debouncedSearch?.length > 0 ? undefined : floorId,
    placeCategoryId: categoryId,
    placeSubCategoryId: subCategoryId ? [subCategoryId] : undefined,
  });
  const { courses: coursesPreferences } = usePreferencesContext();
  const now = useRef(DateTime.now());
  const { data: agendaPages } = useGetAgendaWeeks(
    coursesPreferences,
    now.current,
  );
  const upcomingCommitments = useMemo(
    () =>
      agendaPages?.pages?.[0]?.data
        .filter(i => i.isToday)
        .flatMap(i => i.items)
        .filter(
          i =>
            (i as LectureItem).place != null &&
            i.start >= now.current &&
            i.start.diff(now.current).milliseconds <
              UPCOMING_COMMITMENT_HOURS_OFFSET * 60 * 60 * 1000,
        ) as
        | (LectureItem & { place: Exclude<LectureItem['place'], null> })[]
        | undefined,
    [agendaPages],
  );
  const orderedPlaces = useMemo(() => {
    let result = places?.data?.sort(a =>
      placesSearched.some(p => a.id === p.id) ? -1 : 1,
    ) as PlaceOverviewWithMetadata[] | undefined;
    if (!search) {
      result = result?.filter(p => p.room.name != null);
    }
    if (!upcomingCommitments?.length || !result?.length) {
      return result;
    }
    for (const commitment of upcomingCommitments.reverse()) {
      const placeIndex = result.findIndex(
        p => p.id === resolvePlaceId(commitment.place),
      );
      if (placeIndex !== -1) {
        const place = result.splice(placeIndex, 1)[0];
        place.agendaItem = commitment;
        result.unshift(place);
      }
    }
    return result;
  }, [places?.data, placesSearched, search, upcomingCommitments]);

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
    if (!campus) {
      updatePreference('campusId', 'TO_CEN');
    } else {
      if (!floorId && campus.floors?.length) {
        setFloorId(
          campus.floors.find(f => f.id === 'XPTE')?.id ??
            campus.floors.find(f => f.level === 0)?.id,
        );
      }
      centerToCurrentCampus();
    }
  }, [campus, centerToCurrentCampus, floorId, updatePreference]);

  const displayFloorId = useMemo(() => {
    if (debouncedSearch) {
      const floorIds = new Set(orderedPlaces?.map(p => p.floor.id));
      return floorIds.size === 1 ? orderedPlaces?.[0]?.floor.id : undefined;
    }
    return floorId;
  }, [debouncedSearch, floorId, orderedPlaces]);

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
        onMapIdle(state) {
          // navigation.navigate({
          //   name: 'Places',
          //   params: {
          //     pitch: state.properties.pitch,
          //     bounds: state.properties.bounds,
          //   },
          //   merge: true,
          // });
        },
      },
      mapContent: (
        <>
          <IndoorMapLayer floorId={displayFloorId} />
          <MarkersLayer
            search={debouncedSearch}
            places={orderedPlaces ?? []}
            displayFloor={!displayFloorId}
          />
        </>
      ),
    });
  }, [
    campus,
    displayFloorId,
    floorId,
    headerHeight,
    navigation,
    categoryId,
    places?.data,
    route,
    safeAreaInsets.top,
    debouncedSearch,
    spacing,
    tabsHeight,
    categoryFilterActive,
    bounds,
    orderedPlaces,
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
          {/* <PillIconButton*/}
          {/*  icon={faClock}*/}
          {/*  onPress={() => navigation.navigate('FreeRooms')}*/}
          {/* >*/}
          {/*  {t('freeRoomsScreen.title')}*/}
          {/* </PillIconButton>*/}
          <PillIconButton
            icon={faChalkboardTeacher}
            onPress={() =>
              navigation.navigate({
                name: 'Places',
                key: 'Places:AULA',
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
                key: 'Places:S_STUD',
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
                key: 'Places:BIBLIO',
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
        <Row gap={3} justify="space-between">
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
            orderedPlaces
              ?.filter(
                p =>
                  !debouncedSearch ||
                  p.room.name.toLowerCase().includes(debouncedSearch),
              )
              ?.map(p => ({
                title: p.room.name ?? p.category.subCategory.name,
                subtitle: `${
                  p.agendaItem != null
                    ? formatAgendaItem(p.agendaItem)
                    : placesSearched.some(ps => ps.id === p.id)
                    ? t('common.recentlyViewed')
                    : p.category.name
                } - ${p.floor.name}`,
                linkTo: { screen: 'Place', params: { placeId: p.id } },
              })) ?? [],
          ListEmptyComponent: (
            <EmptyState message={t('placesScreen.noPlacesFound')} />
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
    icon: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2.5],
    },
  });
