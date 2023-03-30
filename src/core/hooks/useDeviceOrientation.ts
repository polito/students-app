import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export enum Orientation {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
}

export const useDeviceOrientation = () => {
  const { height, width } = useWindowDimensions();
  return useMemo(
    () => (height >= width ? Orientation.PORTRAIT : Orientation.LANDSCAPE),
    [width, height],
  );
};
