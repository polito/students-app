import React, { useLayoutEffect } from 'react';

import {
  GetDirections200Response,
  NavigationResponseFeature,
} from '@polito/api-client';
import { LineLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps';

import { courseColors } from '~/core/constants';
import { useGetSite } from '~/core/queries/placesHooks';
import { getIcon } from '~/features/places/utils/getIconPath';

import { getCoordinatesBounds } from '../utils/getCoordinatesBounds';
import { MapNavigationProp } from './MapNavigator';
import { PlacesStackParamList } from './PlacesNavigator';

type Props = {
  pathFeat: GetDirections200Response;
  bottomSheetHeight: number;
  navigation: MapNavigationProp<PlacesStackParamList, 'Indications', undefined>;
};

export const PreViewPathLayer = ({
  pathFeat,
  bottomSheetHeight,
  navigation,
}: Props) => {
  useLayoutEffect(() => {
    const bounds = getCoordinatesBounds(
      pathFeat.data.features.flatMap((feat: NavigationResponseFeature) => {
        return feat.features.geometry.coordinates as [number, number][];
      }),
    );

    navigation.setOptions({
      mapOptions: {
        camera: {
          padding: {
            paddingTop: 50,
            paddingLeft: 50,
            paddingRight: 50,
            paddingBottom: bottomSheetHeight + 20,
          },
          bounds: bounds,
          zoomLevel: 2,
        },
      },
    });
  }, [pathFeat, navigation, bottomSheetHeight]);

  const floorMapNames = useGetSite('TO_CENCIT')?.floors;

  return (
    <>
      {pathFeat.data.features.map(
        ({
          features,
          startPoint: { coordinates: startP },
          endPoint: { coordinates: endP },
          segmentId,
          _private: privateSegment,
        }: NavigationResponseFeature) => (
          <React.Fragment key={`path-fragment-${segmentId}`}>
            <ShapeSource id={`line-source-${segmentId}`} shape={features}>
              <LineLayer
                id={`line-layer-${segmentId}`}
                style={{
                  lineWidth: 8,
                  lineCap: 'round' as const,
                  lineJoin: 'round' as const,
                  lineOpacity: 1,
                  lineColor:
                    courseColors[segmentId % courseColors.length].color,
                  ...(privateSegment === 1 && { lineDasharray: [2, 2] }),
                }}
              />
            </ShapeSource>
            <ShapeSource
              id={`start-point-source-${segmentId}`}
              shape={{
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: startP },
                    properties: {},
                  },
                ],
              }}
            >
              <SymbolLayer
                id={`start-point-layer-${segmentId}`}
                style={{
                  ...styles.startIcon,
                  iconImage:
                    segmentId === 0
                      ? 'start_selection'
                      : privateSegment === 0
                        ? 'start'
                        : 'private_access',
                }}
              />
            </ShapeSource>

            <ShapeSource
              id={`end-point-source-${segmentId}`}
              shape={{
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: endP },
                    properties: {},
                  },
                ],
              }}
            >
              <SymbolLayer
                id={`end-point-layer-${segmentId}`}
                style={{
                  ...styles.icon,
                  iconImage:
                    segmentId === pathFeat.data.features.length - 1
                      ? 'destination_selection'
                      : privateSegment === 0
                        ? getIcon(
                            segmentId || 0,
                            floorMapNames || [],
                            pathFeat.data.features,
                          )
                        : 'start',
                }}
              />
            </ShapeSource>
          </React.Fragment>
        ),
      )}
    </>
  );
};

const styles = {
  startIcon: {
    iconSize: 0.35,
    iconAllowOverlap: true,
  },
  icon: {
    iconSize: 0.45,
    iconAllowOverlap: true,
  },
};
