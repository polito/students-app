/* eslint-disable @typescript-eslint/naming-convention */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Place, PlaceOverview } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { Images, ShapeSource, SymbolLayer } from '@rnmapbox/maps';

import { CATEGORIES_DATA, MARKERS_MIN_ZOOM } from '../constants';
import { CategoryData } from '../types';
import { MapScreenProps } from './MapNavigator';
import { PlacesStackParamList } from './PlacesNavigator';

export interface MarkersLayerProps {
  selectedPoiId?: string;
  search?: string;
  places?: PlaceOverview[];
  displayFloor?: boolean;
}

export const MarkersLayer = ({
  selectedPoiId,
  places = [],
  displayFloor,
}: MarkersLayerProps) => {
  const { navigate } =
    useNavigation<MapScreenProps<PlacesStackParamList>['navigation']>();
  const { t } = useTranslation();
  const { dark, fontSizes, palettes } = useTheme();
  const pois = useMemo((): (Place & CategoryData)[] => {
    return places
      ?.filter(p => {
        const {
          id: catId,
          subCategory: { id: subCatId },
        } = p.category;
        return (
          CATEGORIES_DATA[catId]?.children[subCatId] != null ||
          selectedPoiId === p.id
        );
      })
      ?.map(poi => {
        const categoryData =
          CATEGORIES_DATA[poi.category.id as keyof typeof CATEGORIES_DATA];
        const subcategoryData = categoryData.children[
          poi.category.subCategory.id as keyof typeof categoryData.children
        ] as any;
        const markerData = {
          ...poi,
          ...categoryData,
          ...subcategoryData,
          priority:
            selectedPoiId === poi.id
              ? 0
              : subcategoryData?.priority ?? categoryData.priority,
        };
        if (!markerData.icon) {
          markerData.icon = 'pin';
          markerData.color = 'gray';
        }
        return markerData;
      });
  }, [places, selectedPoiId]);
  return (
    <>
      <Images
        images={{
          bar: require('../../../../assets/map-icons/bar.png'),
          bike: require('../../../../assets/map-icons/bike.png'),
          classroom: require('../../../../assets/map-icons/classroom.png'),
          conference: require('../../../../assets/map-icons/conference.png'),
          lab: require('../../../../assets/map-icons/lab.png'),
          library: require('../../../../assets/map-icons/library.png'),
          medical: require('../../../../assets/map-icons/medical.png'),
          post: require('../../../../assets/map-icons/post.png'),
          print: require('../../../../assets/map-icons/print.png'),
          restaurant: require('../../../../assets/map-icons/restaurant.png'),
          restroom: require('../../../../assets/map-icons/restroom.png'),
          service: require('../../../../assets/map-icons/service.png'),
          stairs: require('../../../../assets/map-icons/stairs.png'),
          study: require('../../../../assets/map-icons/study.png'),
          water: require('../../../../assets/map-icons/water.png'),
          pin: require('../../../../assets/map-icons/pin.png'),
        }}
      />
      {pois && (
        <ShapeSource
          id="poisSource"
          shape={{
            type: 'FeatureCollection',
            features: pois.map((p, i) => ({
              type: 'Feature',
              id: `poi-point-${p.id}`,
              properties: {
                dark,
                index: i,
                icon: p.icon,
                priority: p.priority,
                name: `${p.room.name ?? p.category.subCategory.name}${
                  displayFloor ? `\n${t('common.floor')} ${p.floor.level}` : ''
                }`,
                color:
                  palettes[p.color as keyof Theme['palettes']][
                    dark ? 200 : p.shade ?? 500
                  ],
              },
              geometry: {
                type: 'Point',
                coordinates: [p.longitude, p.latitude],
              },
            })),
          }}
          existing={false}
          onPress={({ features }) => {
            const selectedPoi = features?.[0]
              ? pois?.[features[0].properties?.index]
              : null;
            if (selectedPoi) {
              navigate({
                name: 'Place',
                params: { placeId: selectedPoi.id },
              });
            }
          }}
        >
          <SymbolLayer
            id="markers"
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
            minZoomLevel={MARKERS_MIN_ZOOM}
            aboveLayerID="indoor"
          />
        </ShapeSource>
      )}
    </>
  );
};
