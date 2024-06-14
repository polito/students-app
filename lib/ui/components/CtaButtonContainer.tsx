import { Children, PropsWithChildren } from 'react';
import { Platform, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { useFeedbackContext } from '../../../src/core/contexts/FeedbackContext';
import { useSafeBottomBarHeight } from '../../../src/core/hooks/useSafeBottomBarHeight';

interface Props {
  absolute: boolean;
  modal?: boolean;
  style?: ViewProps['style'];
}

export const CtaButtonContainer = ({
  absolute = true,
  children,
  modal = false,
  style,
}: PropsWithChildren<Props>) => {
  const { left, right } = useSafeAreaInsets();
  const bottomBarHeight = useSafeBottomBarHeight();
  const { isFeedbackVisible } = useFeedbackContext();

  const { spacing } = useTheme();
  return (
    <View
      style={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[5],
          paddingVertical: spacing[5],
        },
        absolute && {
          position: 'absolute',
          width: Platform.select({ android: '100%' }),
          left: Platform.select({ ios: left }),
          right,
          bottom:
            (modal ? 0 : bottomBarHeight) +
            (isFeedbackVisible ? spacing[10] * Children.count(children) : 0),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
