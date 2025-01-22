/* eslint-disable @typescript-eslint/naming-convention */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { PlaceOverview } from '@polito/api-client';
import { PlaceCategory } from '@polito/api-client/models';
import { useNavigation } from '@react-navigation/native';
import { ShapeSource, SymbolLayer } from '@rnmapbox/maps';

import { capitalize } from 'lodash';

import { notNullish } from '../../../utils/predicates';
import { DEFAULT_CATEGORY_MARKER } from '../constants';
import { usePlaceCategoriesMap } from '../hooks/usePlaceCategoriesMap';
import { SearchPlace, isPlace } from '../types';

export interface MarkersLayerProps {
  selectedPoiId?: string;
  search?: string;
  places?: SearchPlace[];
  displayFloor?: boolean;
  categoryId?: string;
  subCategoryId?: string;
  isCrossNavigation?: boolean;
}

export const MarkersLayer = ({
  selectedPoiId,
  places = [],
  displayFloor,
  categoryId,
  subCategoryId,
  search,
  isCrossNavigation = false,
}: MarkersLayerProps) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { dark, fontSizes } = useTheme();
  const placeCategoriesMap = usePlaceCategoriesMap();
  const pois = useMemo((): (SearchPlace &
    PlaceCategory & { siteId: string })[] => {
    if (!placeCategoriesMap) {
      return [];
    }
    let result = places;
    if (!search) {
      result = result?.filter(
        p =>
          selectedPoiId === p.id ||
          (categoryId != null && p.category.id === categoryId) ||
          (subCategoryId != null &&
            (!p.category.subCategory?.id ||
              p.category.subCategory.id === subCategoryId)) ||
          (p.category.id === 'UFF'
            ? !!(p as PlaceOverview).room.name
            : !p.category.subCategory?.id ||
              !!placeCategoriesMap[p.category.subCategory.id]?.highlighted),
      );
    }
    return result?.map(poi => {
      const category = placeCategoriesMap[poi.category.id] ?? {};
      const subcategory = poi.category.subCategory?.id
        ? placeCategoriesMap[poi.category.subCategory.id]
        : null;
      const categoryData = {
        ...category,
        ...(subcategory ?? {}),
      };
      delete (categoryData as any).id;
      delete (categoryData as any).name;

      return {
        ...DEFAULT_CATEGORY_MARKER,
        ...poi,
        ...categoryData,
        siteId: isPlace(poi) ? poi.site.id : poi.siteId,
        priority:
          selectedPoiId === poi.id
            ? 0
            : subcategory?.priority ?? category.priority ?? 100,
      };
    });
  }, [
    categoryId,
    placeCategoriesMap,
    places,
    search,
    selectedPoiId,
    subCategoryId,
  ]);

  if (!pois) {
    return null;
  }

  return (
    <ShapeSource
      id="markersSource"
      shape={{
        type: 'FeatureCollection',
        features: pois.map((p, i) => ({
          type: 'Feature',
          id: `poi-point-${p.id}`,
          properties: {
            dark,
            index: i,
            markerUrl: p.markerUrl,
            priority: p.priority,
            name: capitalize(
              isPlace(p)
                ? [
                    p.room.name ??
                      p.category.subCategory?.name ??
                      p.category.name,
                    displayFloor
                      ? `${t('common.floor')} ${p.floor.level}`
                      : null,
                  ]
                    .filter(notNullish)
                    .join('\n')
                : capitalize(p.name),
            ),
            color: p.color,
          },
          geometry: {
            type: 'Point',
            coordinates: [p.longitude, p.latitude],
          },
        })),
      }}
      onPress={({ features }) => {
        const selectedPoi = features?.[0]
          ? pois?.[features[0].properties?.index]
          : null;
        if (selectedPoi) {
          const screen = isPlace(selectedPoi) ? 'Place' : 'Building';
          if (isCrossNavigation) {
            if (navigation.getId() === 'AgendaTabNavigator') {
              navigation.navigate('PlacesAgendaStack', {
                screen,
                params:
                  screen === 'Place'
                    ? { placeId: selectedPoi.id, isCrossNavigation: true }
                    : {
                        siteId: selectedPoi.siteId,
                        buildingId: selectedPoi.id,
                      },
              });
            } else if (navigation.getId() === 'TeachingTabNavigator') {
              navigation.navigate('PlacesTeachingStack', {
                screen,
                params:
                  screen === 'Place'
                    ? { placeId: selectedPoi.id, isCrossNavigation: true }
                    : {
                        siteId: selectedPoi.siteId,
                        buildingId: selectedPoi.id,
                      },
              });
            }
          } else {
            navigation.navigate('PlacesTab', {
              screen,
              params:
                screen === 'Place'
                  ? { placeId: selectedPoi.id }
                  : {
                      siteId: selectedPoi.siteId,
                      buildingId: selectedPoi.id,
                    },
            });
          }
        }
      }}
    >
      <SymbolLayer
        id="markers"
        aboveLayerID="indoor"
        // Theme-independent hardcoded color
        // eslint-disable-next-line react-native/no-color-literals
        style={{
          iconImage: ['get', 'markerUrl'],
          iconSize: 0.35,
          symbolSortKey: ['get', 'priority'],
          textField: ['get', 'name'],
          textSize: fontSizes['2xs'],
          textFont: ['Open Sans Semibold'],
          textColor: ['get', 'color'],
          textOffset: [0, 1.2],
          textAnchor: 'top',
          textOptional: true,
          textHaloColor: 'white',
          textHaloWidth: dark ? 0 : 0.8,
        }}
      />
    </ShapeSource>
  );
};
