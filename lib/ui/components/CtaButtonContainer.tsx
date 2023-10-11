import { Children, PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { useFeedbackContext } from '../../../src/core/contexts/FeedbackContext';
import { useSafeBottomBarHeight } from '../../../src/core/hooks/useSafeBottomBarHeight';

interface Props {
  absolute: boolean;
}

export const CtaButtonContainer = ({
  absolute = true,
  children,
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
          left: Platform.select({ ios: left }),
          right,
          bottom:
            bottomBarHeight +
            (isFeedbackVisible ? spacing[10] * Children.count(children) : 0),
        },
      ]}
    >
      {children}
    </View>
  );
};
