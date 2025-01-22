import { CameraStop } from '@rnmapbox/maps';

export const getCoordinatesBounds = (
  coordinates: [number, number][],
  padding = 0.0001,
): NonNullable<CameraStop['bounds']> => {
  const lons = coordinates.map(([l]) => l);
  const lats = coordinates.map(([_, l]) => l);
  const n = Math.min(...lats) - padding;
  const s = Math.max(...lats) + padding;
  const w = Math.min(...lons) - padding;
  const e = Math.max(...lons) + padding;
  return {
    ne: [e, n],
    sw: [w, s],
  };
};
