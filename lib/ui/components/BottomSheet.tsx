import { Ref, forwardRef } from 'react';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import BaseBottomSheet, {
  BottomSheetProps as BaseBottomSheetProps,
} from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { TranslucentView } from '../../../src/core/components/TranslucentView';

export type BottomSheetProps = Omit<BaseBottomSheetProps, 'snapPoints'> & {
  snapPoints?: BaseBottomSheetProps['snapPoints'];
  middleSnapPoint?: number;
};

export const BottomSheet = forwardRef(
  (
    { middleSnapPoint = 25, children, style, ...props }: BottomSheetProps,
    ref: Ref<BottomSheetMethods>,
  ) => {
    const { palettes, shapes } = useTheme();
    const panelPosition = useSharedValue(0);

    const cornerStyles = useAnimatedStyle(() => ({
      borderTopLeftRadius: Math.min(panelPosition.value, shapes.lg),
      borderTopRightRadius: Math.min(panelPosition.value, shapes.lg),
    }));

    return (
      <BaseBottomSheet
        ref={ref}
        index={1}
        snapPoints={['3.6%', `${middleSnapPoint}%`, '100%']}
        overDragResistanceFactor={0.9}
        style={[
          {
            overflow: 'hidden',
          },
          cornerStyles,
          style,
        ]}
        handleIndicatorStyle={{
          backgroundColor: palettes.gray[400],
        }}
        backgroundComponent={() => <TranslucentView />}
        animatedPosition={panelPosition}
        {...props}
      >
        {children}
      </BaseBottomSheet>
    );
  },
);
