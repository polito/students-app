import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  text?: string;
}

export const CircularProgress = ({
  progress,
  size = 200,
  strokeWidth = 8,
  text,
}: Props) => {
  const styles = useStylesheet(createStyles);
  const { palettes } = useTheme();
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - animatedProgress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palettes.primary[200]}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palettes.primary[600]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animatedProps={animatedProps}
        />
      </Svg>
      {text && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{text}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = ({ colors, spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    svg: {
      position: 'absolute',
    },
    textContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    text: {
      fontSize: fontSizes.md,
      color: colors.heading,
      textAlign: 'center',
      paddingHorizontal: spacing[4],
    },
  });
