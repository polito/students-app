import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

const liveIndicatorSize = 8;

interface Props {
  showText?: boolean;
}

export const LiveIndicator = ({ showText }: Props) => {
  const { spacing, palettes, fontSizes } = useTheme();
  const anim = useRef(new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim.current, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
      ]),
    ).start();
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginEnd: spacing[2],
      }}
    >
      <View style={{ position: 'relative', marginEnd: spacing[2] }}>
        <Animated.View
          style={{
            backgroundColor: palettes.error[500],
            width: liveIndicatorSize,
            height: liveIndicatorSize,
            borderRadius: liveIndicatorSize,
            opacity: anim.current,
            transform: [
              {
                scale: anim.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2.5, 1],
                }),
              },
            ],
          }}
        />
        <View
          style={{
            backgroundColor: palettes.error[500],
            width: liveIndicatorSize,
            height: liveIndicatorSize,
            borderRadius: liveIndicatorSize,
            position: 'absolute',
          }}
        />
      </View>
      {showText && (
        <Text variant="secondaryText" style={{ fontSize: fontSizes.xs }}>
          Live
        </Text>
      )}
    </View>
  );
};
