import React, { useContext, useEffect, useState } from 'react';

import { Images, LineLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import bbox from '@turf/bbox';

import { useGetSite } from '~/core/queries/placesHooks';

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
  /*
  const featureCollection = useGetPath();

  useEffect(() => {
    if (featureCollection) {
      setPathFeatureCollection(featureCollection.features);
    }
  }, [featureCollection]);
  */

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
      const maxIndex = pathFeatureCollection.length - 1;
      if (index === maxIndex) return 'destination';
      else {
        const currentFloor = floorMapNames?.find(
          floor =>
            floor.id ===
            pathFeatureCollection?.[index].features.properties.fn_fl_id,
        );
        const nextFloor = floorMapNames?.find(
          floor =>
            floor.id ===
            pathFeatureCollection?.[index + 1].features.properties.fn_fl_id,
        );
        if (currentFloor && nextFloor) {
          return currentFloor.level > nextFloor.level ? 'down' : 'up';
        }
      }
    }
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
            id={`line-source-${index.toString()}`}
            shape={featuresArray.features}
            key={`line-source-${index.toString()}`}
          >
            <LineLayer
              id={`line-layer-${index.toString()}`}
              style={{
                lineColor: '#ef7b00',
                lineWidth: 8,
                lineCap: 'round',
                lineJoin: 'round',
                lineOpacity:
                  line === `line-layer-${index.toString()}` ? 1 : 0.3,
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
                key={`start-point-source-${index.toString()}`}
              >
                <SymbolLayer
                  id={`start-point-layer-${index.toString()}`}
                  style={{
                    iconImage: 'start',
                    iconSize: 0.35,
                    iconAllowOverlap: true,
                  }}
                />
              </ShapeSource>

              <ShapeSource
                id={`end-point-source-${index.toString()}`}
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
                    iconImage:
                      index === pathFeatureCollection.length - 1
                        ? 'destination'
                        : checkFloorForIcon(index, 'end'),
                    iconSize: 0.45,
                    iconAllowOverlap: true,
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
