import { Ref, forwardRef, useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import BaseBottomSheet, {
  BottomSheetProps as BaseBottomSheetProps,
  SNAP_POINT_TYPE,
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
      onClose,
      ...props
    }: BottomSheetProps,
    ref: Ref<BottomSheetMethods>,
  ) => {
    const { colors, palettes, shapes, spacing } = useTheme();
    const defaultPosition = useSharedValue(0);
    const panelPosition = animatedPosition ?? defaultPosition;
    const [currentIndex, setCurrentIndex] = useState(0);

    const cornerStyles = useAnimatedStyle(() => {
      const radius = interpolate(
        panelPosition.value,
        [0, shapes.lg],
        [0, shapes.lg],
        Extrapolation.CLAMP,
      );
      return {
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      };
    });

    useEffect(() => {
      const backAction = () => {
        if (currentIndex <= 0) {
          return false; // Allow default back action (e.g., navigating back)
        }
        if (ref && typeof ref === 'object') {
          ref.current?.snapToIndex(0);
        }
        onClose?.();
        return true; // Prevent default back action
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [currentIndex, ref, onClose]);

    return (
      <BaseBottomSheet
        ref={ref}
        index={1}
        snapPoints={[24, `${middleSnapPoint}%`, '100%']}
        overDragResistanceFactor={0.9}
        style={[
          {
            overflow: 'hidden',
            borderTopLeftRadius: shapes.lg,
            borderTopRightRadius: shapes.lg,
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
        onChange={(i: number, position: number, type: SNAP_POINT_TYPE) => {
          setCurrentIndex(i);
          props.onChange?.(i, position, type);
        }}
      >
        {children}
      </BaseBottomSheet>
    );
  },
);
