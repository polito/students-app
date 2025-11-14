import React, { useContext, useEffect, useState } from 'react';

import { Images, LineLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import bbox from '@turf/bbox';

import { useGetSite } from '~/core/queries/placesHooks';
import { lightTheme } from '~/core/themes/light';

import { PlacesContext } from '../contexts/PlacesContext';

const up = require('../../../../assets/map-icons/up.png');
const down = require('../../../../assets/map-icons/down.png');
const start = require('../../../../assets/map-icons/start.png');
const destination = require('../../../../assets/map-icons/destination.png');

type Props = {
  handleSegmentChange: (segment: any) => void;
  pathFeatureCollection: any;
};

export const PathLayer = ({
  handleSegmentChange,
  pathFeatureCollection,
}: Props) => {
  const [selectedFloor] = useState<string | undefined>(undefined);

  const { setFloorId: setMapFloorId, selectedLine: line } =
    useContext(PlacesContext);
  const floorMapNames = useGetSite('TO_CENCIT')?.floors;

  useEffect(() => {
    if (line) {
      const pathBox = bbox({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates:
                pathFeatureCollection[parseInt(line.split('-')[2], 10)].features
                  .geometry.coordinates,
            },
            properties: {},
          },
        ],
      });
      handleSegmentChange(pathBox);
      setMapFloorId(selectedFloor);
    }
  }, [
    line,
    selectedFloor,
    setMapFloorId,
    handleSegmentChange,
    pathFeatureCollection,
  ]);

  const checkFloorForIcon = (index: number, type: string) => {
    if (type === 'start') {
      return 'start';
    } else if (type === 'end') {
      if (index === pathFeatureCollection.length - 1) return 'destination';
      else {
        const currentFloor = floorMapNames?.find(
          floor =>
            floor.id ===
            pathFeatureCollection[index].features.properties.fnFlId,
        );
        const nextFloor = floorMapNames?.find(
          floor =>
            floor.id ===
            pathFeatureCollection[index + 1].features.properties.fnFlId,
        );

        if (currentFloor && nextFloor) {
          return currentFloor.level > nextFloor.level ? 'down' : 'up';
        }
      }
    }
  };

  const handleIcon = (index: number) => {
    if (index === pathFeatureCollection.length - 1) return 'destination';
    return checkFloorForIcon(index, 'end');
  };

  const handleOpacity = (index: number) => {
    if (line?.split('-')[2] === index.toString()) {
      return 1;
    }
    return 0.3;
  };

  return (
    pathFeatureCollection &&
    pathFeatureCollection.length > 0 &&
    pathFeatureCollection.map((featuresArray: any, index: number) => {
      const startP = featuresArray.startPoint.coordinates;
      const endP = featuresArray.endPoint.coordinates;

      return (
        <React.Fragment key={`path-fragment-${index.toString()}`}>
          <Images
            images={{
              up: up,
              down: down,
              start: start,
              destination: destination,
            }}
          />
          <ShapeSource
            id={`line-source-${index}`}
            shape={featuresArray.features}
            key={`line-source-${index}`}
          >
            <LineLayer
              id={`line-layer-${index}`}
              style={{
                ...styles.line,
                lineOpacity: handleOpacity(index),
              }}
            />
          </ShapeSource>
          {line?.split('-')[2] === index.toString() && (
            <>
              <ShapeSource
                id={`start-point-source-${index.toString()}`}
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
                key={`start-point-source-${index}`}
              >
                <SymbolLayer
                  id={`start-point-layer-${index}`}
                  style={styles.startIcon}
                />
              </ShapeSource>

              <ShapeSource
                id={`end-point-source-${index}`}
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
                key={`end-point-source-${index.toString()}`}
              >
                <SymbolLayer
                  id={`end-point-layer-${index.toString()}`}
                  style={{
                    ...styles.icon,
                    iconImage: handleIcon(index),
                  }}
                />
              </ShapeSource>
            </>
          )}
        </React.Fragment>
      );
    })
  );
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
