import ReanimatedSwipeable, {
  SwipeDirection,
  SwipeableProps,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from 'react';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

// Context to manage currently open swipeable (Exclusive Open Logic)
interface SwipeableContextType {
  closeCurrentSwipeable: () => void;
  registerSwipeable: (
    id: string,
    ref: React.RefObject<React.ComponentRef<typeof ReanimatedSwipeable> | null>,
  ) => void;
  unregisterSwipeable: (id: string) => void;
}

const SwipeableContext = createContext<SwipeableContextType | null>(null);

export const SwipeableProvider = ({ children }: { children: ReactNode }) => {
  const openSwipeableRef = useRef<{
    id: string;
    ref: React.RefObject<React.ComponentRef<typeof ReanimatedSwipeable> | null>;
  } | null>(null);

  const closeCurrentSwipeable = useCallback(() => {
    if (openSwipeableRef.current?.ref.current) {
      openSwipeableRef.current.ref.current.close();
      openSwipeableRef.current = null;
    }
  }, []);

  const registerSwipeable = useCallback(
    (
      id: string,
      ref: React.RefObject<React.ComponentRef<
        typeof ReanimatedSwipeable
      > | null>,
    ) => {
      // Close any currently open swipeable if it's different
      if (openSwipeableRef.current && openSwipeableRef.current.id !== id) {
        openSwipeableRef.current.ref.current?.close();
      }
      openSwipeableRef.current = { id, ref };
    },
    [],
  );

  const unregisterSwipeable = useCallback((id: string) => {
    if (openSwipeableRef.current?.id === id) {
      openSwipeableRef.current = null;
    }
  }, []);

  return (
    <SwipeableContext.Provider
      value={{ closeCurrentSwipeable, registerSwipeable, unregisterSwipeable }}
    >
      {children}
    </SwipeableContext.Provider>
  );
};

interface RightActionWrapperProps {
  drag: SharedValue<number>;
  rightActionWidth: number;
  children: ReactNode;
}

const RightActionWrapper = ({
  drag,
  rightActionWidth,
  children,
}: RightActionWrapperProps) => {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + rightActionWidth }],
    };
  });

  return <Reanimated.View style={styleAnimation}>{children}</Reanimated.View>;
};

type SwipeableChildRenderProp = (state: { isSwiping: boolean }) => ReactNode;

interface Props
  extends Omit<Partial<SwipeableProps>, 'renderRightActions' | 'children'> {
  children: ReactNode | SwipeableChildRenderProp;
  rightAction?: ReactNode;
  rightActionWidth?: number;
}

export const Swipeable = ({
  children,
  rightAction,
  rightActionWidth = 88,
  friction = 2,
  enableTrackpadTwoFingerGesture = true,
  rightThreshold = 40,
  overshootRight = false,
  overshootLeft = false,
  ...props
}: Props) => {
  const swipeableRef =
    useRef<React.ComponentRef<typeof ReanimatedSwipeable>>(null);

  const swipeableId = useId();

  const context = useContext(SwipeableContext);
  const [isSwiping, setIsSwiping] = useState(false);

  const animationOptions = {
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
    damping: 25,
    mass: 0.5,
    stiffness: 200,
  };

  const renderRightActions = rightAction
    ? (_prog: SharedValue<number>, drag: SharedValue<number>) => {
        return (
          <RightActionWrapper drag={drag} rightActionWidth={rightActionWidth}>
            {rightAction}
          </RightActionWrapper>
        );
      }
    : undefined;

  const handleSwipeableOpenStartDrag = useCallback(
    (_direction: SwipeDirection.LEFT | SwipeDirection.RIGHT) => {
      setIsSwiping(true);
      context?.registerSwipeable(swipeableId, swipeableRef);
    },
    [context, swipeableId],
  );

  const handleSwipeableClose = useCallback(
    (_direction: SwipeDirection.LEFT | SwipeDirection.RIGHT) => {
      setIsSwiping(false);
      context?.unregisterSwipeable(swipeableId);
    },
    [context, swipeableId],
  );

  const childrenNode =
    typeof children === 'function'
      ? (children as SwipeableChildRenderProp)({ isSwiping })
      : children;

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={friction}
      enableTrackpadTwoFingerGesture={enableTrackpadTwoFingerGesture}
      rightThreshold={rightThreshold}
      overshootRight={overshootRight}
      overshootLeft={overshootLeft}
      renderRightActions={renderRightActions}
      onSwipeableOpenStartDrag={handleSwipeableOpenStartDrag}
      onSwipeableClose={handleSwipeableClose}
      animationOptions={animationOptions}
      {...props}
    >
      <Reanimated.View>{childrenNode}</Reanimated.View>
    </ReanimatedSwipeable>
  );
};
