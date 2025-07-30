import { PropsWithChildren, useState } from 'react';
import { Animated, Easing, Image } from 'react-native';
import BootSplash from 'react-native-bootsplash';

import { SplashContext } from '../contexts/SplashContext';

export function SplashProvider({ children }: PropsWithChildren) {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isSplashLoaded, setIsSplashLoaded] = useState(false);

  return (
    <SplashContext.Provider
      value={{ isAppLoaded, setIsAppLoaded, isSplashLoaded }}
    >
      {children}
      {isAppLoaded && !isSplashLoaded && (
        <AnimatedBootSplash onAnimationEnd={() => setIsSplashLoaded(true)} />
      )}
    </SplashContext.Provider>
  );
}

type Props = {
  onAnimationEnd: () => void;
};

const AnimatedBootSplash = ({ onAnimationEnd }: Props) => {
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(1));

  const { container, logo } = BootSplash.useHideAnimation({
    manifest: require('../../../assets/bootsplash/manifest.json'),
    logo: require('../../../assets/bootsplash/logo.png'),

    animate: () => {
      // Perform animations and call onAnimationEnd
      Animated.timing(opacity, {
        useNativeDriver: true,
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      }).start();
      Animated.timing(scale, {
        useNativeDriver: true,
        toValue: 4,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }).start(() => {
        onAnimationEnd();
      });
    },
  });

  return (
    <Animated.View
      {...container}
      style={[container.style, { opacity, transform: [{ scale }] }]}
    >
      <Image {...logo} />
    </Animated.View>
  );
};
