/* eslint-disable @typescript-eslint/naming-convention */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { PlaceOverview } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { Images, ShapeSource, SymbolLayer } from '@rnmapbox/maps';

import { MapScreenProps } from './MapNavigator';
import { PlacesStackParamList } from './PlacesNavigator';

interface CategoryData {
  icon: string;
  color: string;
  priority: number;
  children: Record<string, Partial<CategoryData>>;
}

const categoriesData: Record<string, CategoryData> = {
  VERT: {
    icon: 'stairs',
    color: 'gray',
    priority: 100,
    children: {
      SCALA: {},
    },
  },
  SERV: {
    icon: 'pin',
    color: 'gray',
    priority: 90,
    children: {
      'PUNTO H2O': { icon: 'water', color: 'lightBlue', priority: 20 },
      WC: { icon: 'restroom', color: 'green' },
      WC_F: { icon: 'restroom', color: 'green' },
      WC_H: { icon: 'restroom', color: 'green' },
      WC_M: { icon: 'restroom', color: 'green' },
    },
  },
  SUPP: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {
      S_CONFEREN: { icon: 'conference' },
    },
  },
  UFF: {
    icon: 'pin',
    color: 'gray',
    priority: 60,
    children: {},
  },
  AULA: {
    icon: 'classroom',
    color: 'navy',
    priority: 40,
    children: {
      AULA: {},
      AULA_DIS: {},
      AULA_INF: {},
      AULA_LAB: {},
    },
  },
  LAB: {
    icon: 'lab',
    color: 'navy',
    priority: 60,
    children: {},
  },
  STUD: {
    icon: 'study',
    color: 'navy',
    priority: 40,
    children: {
      BIBLIO: { icon: 'library' },
      STUD_EST_A: {},
      STUD_EST_P: {},
      S_STUD: {},
    },
  },
  TECN: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {},
  },
  SPEC: {
    icon: 'service',
    color: 'red',
    priority: 60,
    children: {
      BAR: { icon: 'bar' },
      SALA_BAR: { icon: 'bar' },
      MENSA: { icon: 'restaurant' },
      RISTORA: { icon: 'restaurant' },
      Z_RIST: { icon: 'restaurant' },
      CEN_STAMP: { icon: 'print' },
      INFERM: { icon: 'medical' },
      POSTA: { icon: 'post' },
    },
  },
  TBD: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {},
  },
  EST: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {
      PARK_BIKE: { icon: 'bike' },
    },
  },
};

const LOW_ZOOM = 15;

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
  const pois = useMemo(() => {
    return places
      ?.filter(p => {
        const { id: catId, subCategory: subCatId } = p.category;
        return (
          categoriesData[catId]?.children[subCatId] != null ||
          selectedPoiId === p.id
        );
      })
      ?.map(poi => {
        const categoryData =
          categoriesData[poi.category.id as keyof typeof categoriesData];
        const subcategoryData = categoryData.children[
          poi.category.subCategory as keyof typeof categoryData.children
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
                index: i,
                icon: p.icon,
                priority: p.priority,
                name: `${p.room.name ?? p.category.name}${
                  displayFloor ? `\n${t('common.floor')} ${p.floor.level}` : ''
                }`,
                color:
                  palettes[p.color as keyof Theme['palettes']][
                    dark ? 200 : 500
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
            id="poisLayer"
            style={{
              iconImage: ['get', 'icon'],
              iconSize: 0.35,
              symbolSortKey: ['get', 'priority'],
              textField: ['get', 'name'],
              textSize: fontSizes['2xs'],
              textColor: ['get', 'color'],
              textOffset: [0, 1.2],
              textAnchor: 'top',
              textOptional: true,
              textHaloColor: 'white',
              textHaloWidth: dark ? 0 : 0.8,
            }}
            // aboveLayerID="indoor"
            minZoomLevel={LOW_ZOOM}
          />
        </ShapeSource>
      )}
      {/* selectedPoi && (
        <MarkerView
          coordinate={[selectedPoi.longitude, selectedPoi.latitude]}
          anchor={{
            x: 0.5,
            y: 1,
          }}
          style={{
            paddingBottom: 20,
          }}
        >
          <Callout>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate({
                  name: 'Place',
                  params: { placeId: selectedPoi.id },
                });
              }}
            >
              <Row p={2} align="center">
                <Text>{selectedPoi.room.name}</Text>
                <Icon icon={faChevronRight} size={fontSizes.sm} />
              </Row>
            </TouchableOpacity>
          </Callout>
        </MarkerView>
      )*/}
    </>
  );
};
