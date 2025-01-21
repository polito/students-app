import * as React from 'react';
import { useEffect, useMemo } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Feedback } from '@lib/ui/types/Feedback';
import { Theme } from '@lib/ui/types/Theme';

import useLatestCallback from 'use-latest-callback';

import { useScreenReader } from '../../../src/core/hooks/useScreenReader';
import { useTheme } from '../hooks/useTheme';

export type Props = Feedback & {
  /**
   * Whether the Snackbar is currently visible.
   */
  visible: boolean;
  /**
   * Callback called when Snackbar is dismissed. The `visible` prop needs to be updated when this is called.
   */
  onDismiss?: () => void;
};

const DURATION_TIME = 4000; // 4 seconds
const ANIMATION_TIME = 300; // .3 seconds

/**
 * Snackbars provide brief feedback about an operation through a message rendered at the bottom of the container in which it's wrapped.
 */
export const Snackbar = ({
  visible,
  isPersistent = false,
  isError = false,
  action,
  onDismiss,
  text,
  ...rest
}: Props) => {
  const styles = useStylesheet(createStyles);
  const { bottom } = useSafeAreaInsets();
  const { isEnabled, announce } = useScreenReader();
  const { dark, palettes } = useTheme();

  const { current: opacity } = React.useRef<Animated.Value>(
    new Animated.Value(0.0),
  );

  const duration = useMemo(() => {
    return isPersistent ? Number.POSITIVE_INFINITY : DURATION_TIME;
  }, [isPersistent]);

  const hideTimeout = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const [hidden, setHidden] = React.useState(!visible);

  useEffect(() => {
    if (isEnabled && visible) announce(text);
  }, [isEnabled, announce, visible]);

  // useEffect(() => {
  //   if()
  // }, [text]);

  const handleOnVisible = useLatestCallback(() => {
    // show
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setHidden(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: ANIMATION_TIME,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        const isInfinity = duration === Number.POSITIVE_INFINITY;

        if (!isInfinity && onDismiss) {
          hideTimeout.current = setTimeout(
            onDismiss,
            duration,
          ) as unknown as NodeJS.Timeout;
        }
      }
    });
  });

  const handleOnHidden = useLatestCallback(() => {
    // hide
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: ANIMATION_TIME,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setHidden(true);
      }
    });
  });

  React.useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (visible) {
      handleOnVisible();
    } else {
      handleOnHidden();
    }
  }, [visible, handleOnVisible, handleOnHidden]);

  if (hidden) {
    return null;
  }

  const {
    label: actionLabel,
    onPress: onPressAction,
    ...actionProps
  } = action || {};

  const marginLeft = action ? -12 : -16;

  const wrapperPaddings = {
    paddingBottom: bottom,
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, wrapperPaddings]}>
      <Animated.View
        pointerEvents="box-none"
        accessibilityLiveRegion="polite"
        style={[
          styles.container,
          {
            opacity: opacity,
          },
        ]}
        {...rest}
      >
        <Text style={styles.content}>{text}</Text>
        {action && (
          <View style={[styles.actionsContainer, { marginLeft }]}>
            <TouchableHighlight
              underlayColor={palettes.gray[dark ? 300 : 700]}
              onPress={event => {
                onPressAction?.(event);
                onDismiss?.();
              }}
              style={styles.button}
              {...actionProps}
            >
              <Text style={styles.buttonLabel}>{actionLabel!}</Text>
            </TouchableHighlight>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

/**
 * Show the Snackbar for a short duration.
 */
Snackbar.DURATION = DURATION_TIME;
Snackbar.ANIMATION = ANIMATION_TIME;

const createStyles = ({ dark, palettes, shapes, spacing }: Theme) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 60,
      width: '100%',
      paddingHorizontal: spacing[5],
    },
    container: {
      margin: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 48,
      elevation: 6,
      borderRadius: shapes.md,
      backgroundColor: palettes.gray[dark ? 200 : 800],
    },
    content: {
      marginHorizontal: spacing[4],
      marginVertical: 14,
      flex: 1,
      fontWeight: '500',
      color: palettes.gray[dark ? 800 : 50],
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      minHeight: 48,
    },
    button: {
      marginRight: 8,
      marginLeft: 4,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: shapes.md,
    },
    buttonLabel: {
      fontWeight: '500',
      color: palettes.primary[dark ? 600 : 300],
    },
    icon: {
      width: 40,
      height: 40,
      margin: 0,
    },
  });
