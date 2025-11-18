import { Floor, NavigationResponseFeature } from '@polito/api-client';

export const getIcon = (
  index: number,
  floorMapNames: Floor[],
  pathFeatureCollection: NavigationResponseFeature[],
) => {
  if (index >= pathFeatureCollection.length - 1) return 'destination';

  const currentFloor = floorMapNames?.find(
    floor =>
      floor.id === pathFeatureCollection[index].features.properties.fnFlId,
  );
  const nextFloor = floorMapNames?.find(
    floor =>
      floor.id === pathFeatureCollection[index + 1].features.properties.fnFlId,
  );

  if (currentFloor && nextFloor) {
    return currentFloor.level > nextFloor.level ? 'down' : 'up';
  }

  return 'unknown';
};
