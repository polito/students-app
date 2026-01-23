import {
  Children,
  PropsWithChildren,
  cloneElement,
  isValidElement,
} from 'react';
import { Platform, View, ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { BlurView } from '@react-native-community/blur';
import MaskedView from '@react-native-masked-view/masked-view';

import { useFeedbackContext } from '../../../src/core/contexts/FeedbackContext';
import { useSafeBottomBarHeight } from '../../../src/core/hooks/useSafeBottomBarHeight';

interface Props {
  absolute?: boolean;
  modal?: boolean;
  style?: ViewProps['style'];
}

export const GlassCtaContainer = ({
  absolute = true,
  children,
  modal = false,
  style,
}: PropsWithChildren<Props>) => {
  const { left, right } = useSafeAreaInsets();
  const bottomBarHeight = useSafeBottomBarHeight();
  const { isFeedbackVisible } = useFeedbackContext();

  const { spacing, colors } = useTheme();

  const count = Children.count(children);
  const isSingle = count === 1;

  const containerStyle: ViewProps['style'] = [
    {
      display: 'flex',
      flexDirection: isSingle ? 'column' : 'row',
      gap: 10,
      padding: 18,
      width: '100%',
    },
    absolute && {
      position: 'absolute',
      left: Platform.select({ ios: left }),
      right,
      bottom:
        (modal ? 0 : bottomBarHeight) +
        (isFeedbackVisible ? spacing[10] * count : 0),
    },
    style,
  ];

  return (
    <View style={containerStyle}>
      <MaskedView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        maskElement={
          <LinearGradient
            colors={['transparent', 'black']}
            locations={[0, 1]}
            style={{ flex: 1 }}
          />
        }
      >
        <BlurView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          blurType="light"
          blurAmount={20}
          reducedTransparencyFallbackColor="white"
        />
        <View
          style={{
            backgroundColor: colors.glass,
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      </MaskedView>
      {Children.map(children, child => {
        if (!isValidElement(child)) return child;

        // Clone the child to inject props
        const clonedChild = cloneElement(child as any, {
          absolute: false,
          containerStyle: { padding: 0 },
        });

        if (isSingle) {
          return clonedChild;
        }

        return <View style={{ flex: 1 }}>{clonedChild}</View>;
      })}
    </View>
  );
};
