// eslint-disable-next-line no-unused-vars
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export const ORIENTATION = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
};

function getWindowOrientation() {
  const { width, height } = Dimensions.get('window');
  return height >= width ? ORIENTATION.PORTRAIT : ORIENTATION.LANDSCAPE;
}
function useDeviceOrientation() {
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
}

export default useDeviceOrientation;
