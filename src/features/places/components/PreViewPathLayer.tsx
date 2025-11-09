import { useContext, useEffect, useLayoutEffect } from 'react';

import { LineLayer, ShapeSource } from '@rnmapbox/maps';
import bbox from '@turf/bbox';

import { PreferencesContext } from '~/core/contexts/PreferencesContext';
import { useGetPath } from '~/core/queries/placesHooks';

import { DestinationPlaceType } from '../types';
import { MapNavigationProp } from './MapNavigator';
import { PlacesStackParamList } from './PlacesNavigator';

type Props = {
  startRoom: DestinationPlaceType;
  destRoom: DestinationPlaceType;
  setTotDistance: (distance: number | null) => void;
  setStairsAndElevators: (
    stairs: number | null,
    elevators: number | null,
  ) => void;
  navigation: MapNavigationProp<PlacesStackParamList, 'Indications', undefined>;
  screenHeight: number;
  avoidStairs: boolean;
  setIsLoadingPath: (loading: boolean) => void;
  setIsError: (isError: boolean) => void;
};

export const PreViewPathLayer = ({
  startRoom,
  destRoom,
  setTotDistance,
  setStairsAndElevators,
  navigation,
  screenHeight,
  avoidStairs,
  setIsLoadingPath,
  setIsError,
}: Props) => {
  const courses = useContext(PreferencesContext)?.courses;
  const courseColors = Object.values(courses || {}).map(c => c.color);

  const {
    data: pathFeat,
    isLoading,
    isError,
  } = useGetPath({
    startPlaceId: startRoom.placeId,
    destPlaceId: destRoom.placeId,
    avoidStairs: avoidStairs,
  });

  useEffect(() => {
    if (pathFeat && pathFeat.data && !isLoading && !isError) {
      setIsLoadingPath(isLoading);
      setTotDistance(pathFeat.data.totDistance);
      setStairsAndElevators(
        pathFeat.data.stairsCount || 0,
        pathFeat.data.elevatorsCount || 0,
      );
    } else if (isLoading) {
      setIsLoadingPath(isLoading);
    } else if (isError) {
      setIsLoadingPath(false);
      setIsError(true);
    }
  }, [
    pathFeat,
    isLoading,
    isError,
    setTotDistance,
    setStairsAndElevators,
    setIsLoadingPath,
    setIsError,
  ]);

  useLayoutEffect(() => {
    if (pathFeat) {
      const allCoordinates = pathFeat.data.features.flatMap(
        (feat: any) => feat.features.geometry.coordinates,
      );
      const pathBbox = bbox({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: allCoordinates,
            },
            properties: {},
          },
        ],
      });

      const bounds = {
        ne: [pathBbox[2], pathBbox[3]],
        sw: [pathBbox[0], pathBbox[1]],
      };

      navigation.setOptions({
        mapOptions: {
          camera: {
            padding: {
              paddingTop: screenHeight * 0.4,
              paddingBottom: 100,
              paddingLeft: 50,
              paddingRight: 50,
            },
            bounds: bounds,
            zoomLevel: 19,
          },
        },
      });
    }
  }, [pathFeat, navigation, screenHeight]);

  if (isLoading || !pathFeat?.data?.features) {
    return null;
  }

  return pathFeat.data.features.map((featuresArray: any, index: number) => {
    return (
      <ShapeSource
        id={`line-source-${index.toString()}`}
        shape={featuresArray.features}
        key={`line-source-${index.toString()}`}
      >
        <LineLayer
          id={`line-layer-${index.toString()}`}
          style={{
            lineColor: courseColors[index % courseColors.length],
            lineWidth: 8,
            lineCap: 'round',
            lineJoin: 'round',
            lineOpacity: 1,
          }}
        />
      </ShapeSource>
    );
  });
};
