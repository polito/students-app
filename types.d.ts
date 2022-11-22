declare module 'react-native-mime-types' {
  function extension(type: string): string;
}

declare module 'react-native-path' {
  function dirname(path: string): string;
}

declare module 'react-native-file-viewer' {
  function open(path: string): void;
}

declare module '@kyupss/native-swipeable' {
  import { PropsWithChildren } from 'react';
  import { ViewStyle } from 'react-native';

  function Swipeable(
    props: PropsWithChildren<
      Partial<{
        leftContent: JSX.Element;
        rightContent: JSX.Element;
        leftButtons: JSX.Element[];
        rightButtons: JSX.Element[];
        onLeftActionActivate: () => void;
        onLeftActionDeactivate: () => void;
        onLeftActionRelease: () => void;
        onLeftActionComplete: () => void;
        leftActionActivationDistance: number;
        leftActionReleaseAnimationFn: () => void;
        leftActionReleaseAnimationConfig: any;
        onRightActionActivate: () => void;
        onRightActionDeactivate: () => void;
        onRightActionRelease: () => void;
        onRightActionComplete: () => void;
        rightActionActivationDistance: number;
        rightActionReleaseAnimationFn: () => void;
        rightActionReleaseAnimationConfig: any;
        onLeftButtonsActivate: () => void;
        onLeftButtonsDeactivate: () => void;
        onLeftButtonsOpenRelease: () => void;
        onLeftButtonsOpenComplete: () => void;
        onLeftButtonsCloseRelease: () => void;
        onLeftButtonsCloseComplete: () => void;
        leftButtonWidth: number;
        leftButtonsActivationDistance: number;
        leftButtonsOpenReleaseAnimationFn: () => void;
        leftButtonsOpenReleaseAnimationConfig: any;
        leftButtonsCloseReleaseAnimationFn: () => void;
        leftButtonsCloseReleaseAnimationConfig: any;
        onRightButtonsActivate: () => void;
        onRightButtonsDeactivate: () => void;
        onRightButtonsOpenRelease: () => void;
        onRightButtonsOpenComplete: () => void;
        onRightButtonsCloseRelease: () => void;
        onRightButtonsCloseComplete: () => void;
        rightButtonWidth: number;
        rightButtonsActivationDistance: number;
        rightButtonsOpenReleaseAnimationFn: () => void;
        rightButtonsOpenReleaseAnimationConfig: any;
        rightButtonsCloseReleaseAnimationFn: () => void;
        rightButtonsCloseReleaseAnimationConfig: any;
        onSwipeStart: () => void;
        onSwipeMove: () => void;
        onSwipeRelease: () => void;
        onSwipeComplete: () => void;
        swipeReleaseAnimationFn: () => void;
        swipeReleaseAnimationConfig: any;
        onRef: (ref) => void;
        onPanAnimatedValueRef: (ref) => void;
        swipeStartMinDistance: number;
        style: ViewStyle;
        leftContainerStyle: ViewStyle;
        leftButtonContainerStyle: ViewStyle;
        rightContainerStyle: ViewStyle;
        rightButtonContainerStyle: ViewStyle;
        contentContainerStyle: ViewStyle;
      }>
    >,
  ): JSX.Element;
}
