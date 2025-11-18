import { useLayoutEffect, useMemo } from 'react';

import {
  GeoJSONFeatureGeometry,
  GetDirections200Response,
  NavigationResponseFeature,
} from '@polito/api-client';
import { LineLayer, ShapeSource } from '@rnmapbox/maps';

import { courseColors } from '~/core/constants';

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

  return (
    <>
      {pathFeat.data.features.map(
        (featuresArray: NavigationResponseFeature) => (
          <ShapeLine
            key={`shape-line-${featuresArray.segmentId}`}
            index={featuresArray.segmentId || 0}
            features={featuresArray.features}
          />
        ),
      )}
    </>
  );
};

const ShapeLine = ({
  index,
  features,
}: {
  index: number;
  features: GeoJSONFeatureGeometry;
}) => {
  const style = useMemo(
    () => ({
      lineWidth: 8,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
      lineOpacity: 1,
      lineColor: courseColors[index % courseColors.length].color,
    }),
    [index],
  );
  return (
    <ShapeSource id={`line-source-${index}`} shape={features}>
      <LineLayer id={`line-layer-${index}`} style={style} />
    </ShapeSource>
  );
};
