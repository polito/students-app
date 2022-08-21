import { PropsWithChildren } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useHeaderHeight } from '@react-navigation/elements';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { TranslucentView } from './TranslucentView';

interface Props {
  scrollTop: Animated.Value;
}

const borderWidth = Platform.select({ ios: StyleSheet.hairlineWidth });

export const SubHeader = ({
  scrollTop,
  children,
}: PropsWithChildren<Props>) => {
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const colorScheme = useColorScheme();

  return (
    <View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity:
              Platform.OS === 'ios'
                ? scrollTop.interpolate({
                    inputRange: [-headerHeight, -headerHeight + 3],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  })
                : 1,
            backgroundColor: Platform.select({ android: colors.surface }),
            elevation: 5,
            borderTopWidth: borderWidth,
            borderBottomWidth: borderWidth,
            borderColor: (colorScheme === 'light' ? DefaultTheme : DarkTheme)
              .colors.border,
          },
        ]}
      >
        {Platform.OS === 'ios' ? (
          <TranslucentView style={StyleSheet.absoluteFill} />
        ) : null}
      </Animated.View>
      {children}
    </View>
  );
};
