import { useMemo } from 'react';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { RasterLayer, RasterSource } from '@rnmapbox/maps';

import { INTERIORS_MIN_ZOOM, MAX_ZOOM } from '../constants';

export interface IndoorMapLayerProps {
  floorId?: string;
}

export const IndoorMapLayer = ({ floorId }: IndoorMapLayerProps) => {
  const { dark } = useTheme();
  const colorScheme = useMemo(() => (dark ? 'dark' : 'light'), [dark]);
  const _floorId = floorId?.toLowerCase();

  if (!_floorId) {
    return null;
  }

  return (
    <RasterSource
      key={`indoorSource:${colorScheme}:${_floorId}`}
      tileUrlTemplates={[
        `https://app.didattica.polito.it/tiles/int-${colorScheme}-${_floorId}/{z}/{x}/{y}.png?v=2`,
        // `http://192.168.1.141:6788/map_gen/tile/{z}/{x}/{y}.png`,
      ]}
      tileSize={256}
      maxZoomLevel={MAX_ZOOM}
      minZoomLevel={INTERIORS_MIN_ZOOM}
      id="indoorSource"
      existing={false}
    >
      <RasterLayer style={null} id="indoor" aboveLayerID="outdoor" />
    </RasterSource>
  );
};
