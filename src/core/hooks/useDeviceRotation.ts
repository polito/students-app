import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

import { Orientation } from './useDeviceOrientation.ts';

export const useDeviceRotation = () => {
  const [isRotating, setIsRotating] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>(
    Dimensions.get('window').width > Dimensions.get('window').height
      ? Orientation.LANDSCAPE
      : Orientation.PORTRAIT,
  );

  useEffect(() => {
    const onChange = () => {
      setIsRotating(true);
      const { width, height } = Dimensions.get('window');

      const newOrientation =
        width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
      setOrientation(newOrientation);

      setTimeout(() => {
        setIsRotating(false);
      }, 300);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  return { isRotating, orientation };
};
