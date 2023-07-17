import { Ref, forwardRef } from 'react';
import { Platform } from 'react-native';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import BaseBottomSheet, {
  BottomSheetProps as BaseBottomSheetProps,
} from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { TranslucentView } from '../../../src/core/components/TranslucentView';
import { IS_ANDROID } from '../../../src/core/constants';

export type BottomSheetProps = Omit<BaseBottomSheetProps, 'snapPoints'> & {
  snapPoints?: BaseBottomSheetProps['snapPoints'];
  middleSnapPoint?: number;
};

export const BottomSheet = forwardRef(
  (
    {
      middleSnapPoint = 25,
      children,
      style,
      animatedPosition,
      ...props
    }: BottomSheetProps,
    ref: Ref<BottomSheetMethods>,
  ) => {
    const { colors, palettes, shapes, spacing } = useTheme();
    const defaultPosition = useSharedValue(0);
    const panelPosition = animatedPosition ?? defaultPosition;

    const cornerStyles = useAnimatedStyle(() => ({
      borderTopLeftRadius: Math.min(panelPosition.value, shapes.lg),
      borderTopRightRadius: Math.min(panelPosition.value, shapes.lg),
    }));

    return (
      <BaseBottomSheet
        ref={ref}
        index={1}
        snapPoints={[24, `${middleSnapPoint}%`, '100%']}
        overDragResistanceFactor={0.9}
        style={[
          {
            overflow: 'hidden',
          },
          IS_ANDROID && { elevation: 12 },
          cornerStyles,
          style,
        ]}
        handleIndicatorStyle={{
          backgroundColor: palettes.gray[400],
        }}
        handleStyle={{
          paddingVertical: spacing[1.5],
        }}
        backgroundComponent={() => (
          <TranslucentView
            fallbackOpacity={1}
            style={{
              backgroundColor: Platform.select({ android: colors.background }),
            }}
          />
        )}
        animatedPosition={panelPosition}
        {...props}
      >
        {children}
      </BaseBottomSheet>
    );
  },
);
