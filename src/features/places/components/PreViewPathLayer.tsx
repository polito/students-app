import { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';

import { GetDirections200Response } from '@polito/api-client';
import { LineLayer, ShapeSource } from '@rnmapbox/maps';

import { courseColors as colors } from '~/core/constants';

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
  const styles = createStyles();

  useLayoutEffect(() => {
    const bounds = getCoordinatesBounds(
      pathFeat.data.features.flatMap(
        (feat: any) => feat.features.geometry.coordinates,
      ),
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

  if (pathFeat.data.features.length > 0) {
    return pathFeat.data.features.map((featuresArray: any, index: number) => (
      <ShapeSource
        id={`line-source-${index}`}
        shape={featuresArray.features}
        key={`line-source-${index}`}
      >
        <LineLayer
          id={`line-layer-${index}`}
          style={{
            ...styles.segment,
            lineColor: colors[index % colors.length].color,
          }}
        />
      </ShapeSource>
    ));
  }
};

const createStyles = () =>
  StyleSheet.create({
    segment: {
      lineWidth: 8,
      lineCap: 'round',
      lineJoin: 'round',
      lineOpacity: 1,
    },
  } as LineLayer['props']['style']);
