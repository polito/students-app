/* eslint-disable @typescript-eslint/naming-convention */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { ShapeSource, SymbolLayer } from '@rnmapbox/maps';

import { capitalize } from 'lodash';

import { CATEGORIES_DATA, SUBCATEGORIES_INITIALLY_SHOWN } from '../constants';
import {
  CategoryData,
  PlaceOverviewWithMetadata,
  SearchPlace,
  isPlace,
} from '../types';
import { useFormatAgendaItem } from '../utils/formatAgendaItem';

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
  const { dark, fontSizes, palettes } = useTheme();
  const formatAgendaItem = useFormatAgendaItem();
  const pois = useMemo((): (SearchPlace & CategoryData)[] => {
    let result = places;
    if (!search) {
      result = result?.filter(
        p =>
          selectedPoiId === p.id ||
          (categoryId != null &&
            (p as PlaceOverviewWithMetadata).category?.id === categoryId) ||
          (subCategoryId != null &&
            (p as PlaceOverviewWithMetadata).category?.subCategory.id ===
              subCategoryId) ||
          (p.category.id === 'UFF'
            ? !!(p as PlaceOverviewWithMetadata).room?.name
            : (p as PlaceOverviewWithMetadata).category?.subCategory.id &&
              SUBCATEGORIES_INITIALLY_SHOWN.includes(
                (p as PlaceOverviewWithMetadata).category?.subCategory.id,
              )),
      );
    }
    return result?.map(poi => {
      const categoryData = (poi as PlaceOverviewWithMetadata).category?.id
        ? CATEGORIES_DATA[
            (poi as PlaceOverviewWithMetadata).category
              .id as keyof typeof CATEGORIES_DATA
          ] ?? CATEGORIES_DATA.default
        : CATEGORIES_DATA.default;
      const subcategoryData = (poi as PlaceOverviewWithMetadata).category
        ?.subCategory?.id
        ? (categoryData.children[
            (poi as PlaceOverviewWithMetadata).category.subCategory
              .id as keyof typeof categoryData.children
          ] as any) ?? {}
        : {};

      const markerData = {
        ...poi,
        ...categoryData,
        ...subcategoryData,
        priority:
          selectedPoiId === poi.id ||
          (poi as PlaceOverviewWithMetadata).agendaItem != null
            ? 0
            : subcategoryData?.priority ?? categoryData.priority,
      };
      if (!markerData.icon) {
        markerData.icon = 'pin';
        markerData.color = 'gray';
      }
      return markerData;
    });
  }, [categoryId, places, search, selectedPoiId, subCategoryId]);

  return (
    pois && (
      <ShapeSource
        id="poisSource"
        shape={{
          type: 'FeatureCollection',
          features: pois.map((p, i) => {
            return {
              type: 'Feature',
              id: `poi-point-${p.id}`,
              properties: {
                dark,
                index: i,
                icon: p.icon,
                priority: p.priority,
                name: capitalize(
                  isPlace(p)
                    ? `${p.room.name ?? p.category.subCategory.name}${
                        p.agendaItem != null
                          ? `\n${formatAgendaItem(p.agendaItem, true)}`
                          : displayFloor
                          ? `\n${t('common.floor')} ${p.floor.level}`
                          : ''
                      }`
                    : p.name,
                ),
                color:
                  palettes[p.color as keyof Theme['palettes']][
                    dark ? 200 : p.shade ?? 500
                  ],
              },
              geometry: {
                type: 'Point',
                coordinates: [p.longitude, p.latitude],
              },
            };
          }),
        }}
        onPress={({ features }) => {
          const selectedPoi = features?.[0]
            ? pois?.[features[0].properties?.index]
            : null;
          if (selectedPoi) {
            if (isCrossNavigation) {
              if (navigation.getId() === 'AgendaTabNavigator') {
                navigation.navigate('PlacesAgendaStack', {
                  screen: 'Place',
                  params: { placeId: selectedPoi.id, isCrossNavigation: true },
                });
              } else if (navigation.getId() === 'TeachingTabNavigator') {
                navigation.navigate('PlacesTeachingStack', {
                  screen: 'Place',
                  params: { placeId: selectedPoi.id, isCrossNavigation: true },
                });
              }
            } else {
              navigation.navigate('PlacesTab', {
                screen: 'Place',
                params: { placeId: selectedPoi.id },
              });
            }
          }
        }}
      >
        <SymbolLayer
          id="markers"
          // Theme-independent hardcoded color
          // eslint-disable-next-line react-native/no-color-literals
          style={{
            iconImage: ['get', 'icon'],
            iconSize: 0.35,
            symbolSortKey: ['get', 'priority'],
            textField: ['get', 'name'],
            textSize: fontSizes['2xs'],
            textFont: ['Open Sans Semibold', 'Arial Unicode MS Regular'],
            textColor: ['get', 'color'],
            textOffset: [0, 1.2],
            textAnchor: 'top',
            textOptional: true,
            textHaloColor: 'white',
            textHaloWidth: dark ? 0 : 0.8,
          }}
        />
      </ShapeSource>
    )
  );
};
