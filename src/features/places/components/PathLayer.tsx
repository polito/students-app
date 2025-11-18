import React, { useContext, useEffect, useState } from 'react';

import { NavigationResponseFeature } from '@polito/api-client';
import { LineLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import bbox from '@turf/bbox';

import { useGetSite } from '~/core/queries/placesHooks';
import { lightTheme } from '~/core/themes/light';
import { getIcon } from '~/features/places/utils/getIconPath';

import { PlacesContext } from '../contexts/PlacesContext';

type Props = {
  handleSegmentChange: (segment: any) => void;
  pathFeatureCollection: NavigationResponseFeature[];
};

export const PathLayer = ({
  handleSegmentChange,
  pathFeatureCollection,
}: Props) => {
  const [selectedFloor] = useState<string | undefined>(undefined);

  const { setFloorId: setMapFloorId, selectedSegmentId } =
    useContext(PlacesContext);
  const floorMapNames = useGetSite('TO_CENCIT')?.floors;

  useEffect(() => {
    if (selectedSegmentId) {
      const pathBox = bbox({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates:
                pathFeatureCollection.find(
                  p => p.segmentId === selectedSegmentId,
                )?.features.geometry.coordinates || [],
            },
            properties: {},
          },
        ],
      });
      handleSegmentChange(pathBox);
      setMapFloorId(selectedFloor);
    }
  }, [
    selectedSegmentId,
    selectedFloor,
    setMapFloorId,
    handleSegmentChange,
    pathFeatureCollection,
  ]);

  const handleOpacity = (segmentId: number) =>
    selectedSegmentId === segmentId ? 1 : 0.3;

  return pathFeatureCollection?.length > 0 ? (
    <React.Fragment>
      {pathFeatureCollection.map(
        ({
          features,
          startPoint: { coordinates: startP },
          endPoint: { coordinates: endP },
          segmentId,
        }: NavigationResponseFeature) => (
          <React.Fragment key={`path-fragment-${segmentId}`}>
            <ShapeSource id={`line-source-${segmentId}`} shape={features}>
              <LineLayer
                id={`line-layer-${segmentId}`}
                style={{
                  ...styles.line,
                  lineOpacity: handleOpacity(segmentId),
                }}
              />
            </ShapeSource>
            {selectedSegmentId === segmentId && (
              <>
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
                    style={styles.startIcon}
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
                      iconImage: getIcon(
                        segmentId || 0,
                        floorMapNames || [],
                        pathFeatureCollection,
                      ),
                    }}
                  />
                </ShapeSource>
              </>
            )}
          </React.Fragment>
        ),
      )}
    </React.Fragment>
  ) : null;
};

const styles = {
  line: {
    lineColor: lightTheme.palettes.orange[600],
    lineWidth: 8,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  },
  startIcon: {
    iconImage: 'start',
    iconSize: 0.35,
    iconAllowOverlap: true,
  },
  icon: {
    iconSize: 0.45,
    iconAllowOverlap: true,
  },
};
