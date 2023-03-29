import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export enum Orientation {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
}

const getWindowOrientation = () => {
  const { width, height } = Dimensions.get('window');
  return height >= width ? Orientation.PORTRAIT : Orientation.LANDSCAPE;
};

export const useDeviceOrientation = () => {
  const [deviceOrientation, setDeviceOrientation] =
    useState(getWindowOrientation);

  useEffect(() => {
    function updateState() {
      setDeviceOrientation(getWindowOrientation());
    }
    const changeDimensionListener = Dimensions.addEventListener(
      'change',
      updateState,
    );
    return () => {
      changeDimensionListener.remove();
    };
  }, [deviceOrientation]);

  return deviceOrientation;
};
