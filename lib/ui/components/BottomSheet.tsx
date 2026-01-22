import {
  Ref,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BackHandler, Platform } from 'react-native';
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedReaction,
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

const BottomSheetKeyboardContext = createContext<{
  onTextFieldFocus: () => void;
} | null>(null);

export const useBottomSheetKeyboard = () => {
  const context = useContext(BottomSheetKeyboardContext);
  return context;
};

export type BottomSheetProps = Omit<BaseBottomSheetProps, 'snapPoints'> & {
  snapPoints?: BaseBottomSheetProps['snapPoints'];
  middleSnapPoint?: number;
  enableAndroidKeyboardHandling?: boolean;
};

export const BottomSheet = forwardRef(
  (
    {
      middleSnapPoint = 25,
      children,
      style,
      animatedPosition,
      onClose,
      enableAndroidKeyboardHandling = false,
      ...props
    }: BottomSheetProps,
    ref: Ref<BottomSheetMethods>,
  ) => {
    const { colors, palettes, shapes, spacing } = useTheme();
    const defaultPosition = useSharedValue(0);
    const panelPosition = animatedPosition ?? defaultPosition;
    const [currentIndex, setCurrentIndex] = useState(0);
    const keyboard = useAnimatedKeyboard();
    const baseBottomSheetRef = useRef<BottomSheetMethods | null>(null);
    const previousIndexRef = useRef<number>(1);
    const isKeyboardHandlingRef = useRef<boolean>(false);
    const lastKeyboardHeightRef = useRef<number>(0);
    const defaultSnapPoints = [
      Platform.OS === 'android' ? 58 : 64,
      `${middleSnapPoint}%`,
      '100%',
    ];
    const snapPoints = props.snapPoints ?? defaultSnapPoints;
    const handleKeyboardOpen = (height: number) => {
      if (
        !IS_ANDROID ||
        !enableAndroidKeyboardHandling ||
        !baseBottomSheetRef.current ||
        isKeyboardHandlingRef.current
      ) {
        return;
      }

      const heightDiff = Math.abs(height - lastKeyboardHeightRef.current);
      if (heightDiff < 10 && lastKeyboardHeightRef.current > 0) {
        return;
      }

      isKeyboardHandlingRef.current = true;
      previousIndexRef.current = currentIndex;
      lastKeyboardHeightRef.current = height;

      requestAnimationFrame(() => {
        if (baseBottomSheetRef.current) {
          const snapPointsArray = Array.isArray(snapPoints) ? snapPoints : [];
          const targetIndex = snapPointsArray.length > 1 ? 1 : currentIndex;
          baseBottomSheetRef.current.snapToIndex(targetIndex);
          setTimeout(() => {
            isKeyboardHandlingRef.current = false;
          }, 300);
        }
      });
    };

    useAnimatedReaction(
      () => keyboard.height.value,
      (height, previous) => {
        if (!IS_ANDROID || !enableAndroidKeyboardHandling) {
          return;
        }
        const previousHeight = previous ?? 0;
        if (height > 0 && previousHeight === 0) {
          runOnJS(handleKeyboardOpen)(height);
        }
      },
    );

    const handleTextFieldFocus = () => {
      if (
        !IS_ANDROID ||
        !enableAndroidKeyboardHandling ||
        !baseBottomSheetRef.current ||
        isKeyboardHandlingRef.current
      ) {
        return;
      }
      if (lastKeyboardHeightRef.current === 0) {
        previousIndexRef.current = currentIndex;
        const snapPointsArray = Array.isArray(snapPoints) ? snapPoints : [];
        const targetIndex = snapPointsArray.length > 1 ? 1 : currentIndex;
        if (targetIndex !== currentIndex) {
          requestAnimationFrame(() => {
            if (baseBottomSheetRef.current) {
              baseBottomSheetRef.current.snapToIndex(targetIndex);
            }
          });
        }
      }
    };

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
        if (currentIndex <= 0 || !ref || typeof ref !== 'object') {
          return false; // Allow default back action (e.g., navigating back)
        }
        ref.current?.snapToIndex(0);
        onClose?.();
        return true; // Prevent default back action
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [currentIndex, ref, onClose]);

    useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        baseBottomSheetRef.current = ref.current;
      }
    }, [ref, currentIndex]);

    return (
      <BottomSheetKeyboardContext.Provider
        value={
          enableAndroidKeyboardHandling
            ? { onTextFieldFocus: handleTextFieldFocus }
            : null
        }
      >
        <BaseBottomSheet
          ref={ref}
          index={1}
          snapPoints={snapPoints}
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
                backgroundColor: Platform.select({
                  android: colors.background,
                }),
              }}
            />
          )}
          animatedPosition={panelPosition}
          android_keyboardInputMode={
            IS_ANDROID && enableAndroidKeyboardHandling
              ? 'adjustPan'
              : undefined
          }
          {...props}
          onChange={(i: number, position: number, type: SNAP_POINT_TYPE) => {
            if (!isKeyboardHandlingRef.current) {
              setCurrentIndex(i);
            }
            props.onChange?.(i, position, type);
          }}
        >
          {children}
        </BaseBottomSheet>
      </BottomSheetKeyboardContext.Provider>
    );
  },
);
