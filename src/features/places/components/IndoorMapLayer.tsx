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

  return (
    <>
      <RasterLayer
        key={`indoor:${colorScheme}:${_floorId}`}
        id="indoor"
        sourceID="indoorSource"
        aboveLayerID="outdoor"
        style={{ rasterOpacity: 1 }}
      />
      {_floorId && (
        <RasterSource
          key={`indoorSource:${colorScheme}:${_floorId}`}
          id="indoorSource"
          tileUrlTemplates={[
            `https://app.didattica.polito.it/tiles/int-${colorScheme}-${_floorId}/{z}/{x}/{y}.png`,
          ]}
          tileSize={256}
          maxZoomLevel={MAX_ZOOM}
          minZoomLevel={INTERIORS_MIN_ZOOM}
          existing={false}
        />
      )}
    </>
  );
};
