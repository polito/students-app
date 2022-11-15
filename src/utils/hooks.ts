import { SetStateAction, useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export const useScreenDimensions = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('screen'));

  useEffect(() => {
    const onChange = (result: { screen: SetStateAction<ScaledSize> }) => {
      setScreenData(result.screen);
    };

    Dimensions.addEventListener('change', onChange);
    // return () => Dimensions?.removeEventListener('change', onChange);
  });

  return {
    ...screenData,
    isLandscape: screenData.width > screenData.height,
  };
};
