import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';

import { SplashContext } from '../contexts/SplashContext';

export function SplashProvider({ children }: PropsWithChildren) {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isSplashLoaded, setIsSplashLoaded] = useState(false);
  return (
    <SplashContext.Provider
      value={{ isAppLoaded, setIsAppLoaded, isSplashLoaded }}
    >
      {children}
      <Splash isAppLoaded={isAppLoaded} setIsSplashLoaded={setIsSplashLoaded} />
    </SplashContext.Provider>
  );
}

enum SplashPhases {
  'SHOWN',
  'FADING',
  'HIDDEN',
}

export const Splash = ({
  isAppLoaded,
  setIsSplashLoaded,
}: {
  isAppLoaded: boolean;
  setIsSplashLoaded: Dispatch<SetStateAction<boolean>>;
}) => {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const [splashPhase, setSplashPhase] = useState<SplashPhases>(
    SplashPhases.SHOWN,
  );

  const dimensions = useWindowDimensions();
  const [imageStyle, setImageStyle] = useState({});

  // Splash image height / width
  const splashImageRatio = 1.476;

  // Resize image based on screen rotation
  useEffect(() => {
    if (dimensions.height > dimensions.width) {
      setImageStyle({
        width: dimensions.width / 3,
        height: (dimensions.width / 3) * splashImageRatio,
      });
    } else {
      setImageStyle({
        width: dimensions.height / 3 / splashImageRatio,
        height: dimensions.height / 3,
      });
    }
  }, [dimensions]);

  useEffect(() => {
    if (splashPhase === SplashPhases.SHOWN) {
      if (isAppLoaded) {
        setSplashPhase(SplashPhases.FADING);
      }
    }
  }, [isAppLoaded, splashPhase]);

  useEffect(() => {
    if (splashPhase === SplashPhases.FADING) {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500, // Fade out duration
        delay: 500, // Minimum time the logo will stay visible
        useNativeDriver: true,
      }).start(() => {
        setSplashPhase(SplashPhases.HIDDEN);
        setIsSplashLoaded(true);
      });
    }
  }, [containerOpacity, splashPhase]);

  if (splashPhase === SplashPhases.HIDDEN) return null;

  return (
    <Animated.View
      collapsable={false}
      style={[style.container, { opacity: containerOpacity }]}
    >
      <Animated.Image
        source={require('../../../assets/images/splash.png')}
        fadeDuration={0}
        style={imageStyle}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const style = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#002B49', // Must be hardcoded as theme is not initialized yet on Splash appearance
    alignItems: 'center',
    justifyContent: 'center',
  },
});
