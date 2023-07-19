import { useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { useSafeBottomBarHeight } from '../../../src/core/hooks/useSafeBottomBarHeight';

interface Props extends TouchableHighlightProps {
  containerStyle?: ViewStyle;
  icon?: any;
  absolute?: boolean;
  title: string;
  rightExtra?: JSX.Element;
  loading?: boolean;
  action: () => unknown | Promise<unknown>;
  successMessage?: string;
  destructive?: boolean;
  hint?: string;
}

/**
 * A call-to-action button with in-place async action feedback
 *
 * If `action` returns a Promise, its result will be used to show
 * a temporary success message before moving to the next state
 */
export const CtaButton = ({
  style,
  absolute = true,
  title,
  loading,
  successMessage,
  disabled,
  destructive = false,
  action,
  icon,
  rightExtra,
  hint,
  containerStyle,
  ...rest
}: Props) => {
  const { palettes, fontSizes, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const { left, right } = useSafeAreaInsets();
  const bottomBarHeight = useSafeBottomBarHeight();
  const [showSuccess, setShowSuccess] = useState(false);
  const successMessageRef = useRef<string>();
  const destructiveRef = useRef<boolean>();

  const onPress = () => {
    successMessageRef.current = successMessage;
    destructiveRef.current = destructive;
    const promise = action();
    if (promise instanceof Promise) {
      promise.then(() => {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        absolute && [
          {
            position: 'absolute',
            left: Platform.select({ ios: left }),
            right,
            bottom: bottomBarHeight,
          },
        ],
        !!hint && { paddingTop: spacing[3] },
        containerStyle,
      ]}
    >
      {hint && <Text style={styles.hint}>{hint}</Text>}
      <TouchableHighlight
        accessibilityRole="button"
        underlayColor={
          (showSuccess ? destructiveRef.current : destructive)
            ? palettes.danger[700]
            : palettes.primary[600]
        }
        disabled={disabled || loading || showSuccess}
        style={[
          styles.button,
          {
            backgroundColor: (
              showSuccess ? destructiveRef.current : destructive
            )
              ? palettes.danger[600]
              : palettes.primary[500],
          },
          disabled && styles.disabledButton,
          style,
        ]}
        accessibilityLabel={title}
        onPress={onPress}
        {...rest}
      >
        <View>
          <View style={styles.stack}>
            {loading && <ActivityIndicator color="white" />}
          </View>
          <Row style={{ opacity: loading ? 0 : 1 }}>
            {/* {!loading && ( */}
            {/*   <View style={{ marginHorizontal: spacing[1] }}>{icon}</View> */}
            {/* )} */}
            {showSuccess ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  icon={faCheckCircle}
                  size={fontSizes.xl}
                  color="white"
                  style={styles.icon}
                />
                {successMessageRef.current && (
                  <Text style={styles.textStyle}>
                    {successMessageRef.current}
                  </Text>
                )}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {icon && (
                  <Icon
                    icon={icon}
                    size={fontSizes.xl}
                    color={palettes.text[100]}
                    style={{ marginRight: spacing[2] }}
                  />
                )}
                <Text style={styles.textStyle}>{title}</Text>
                {rightExtra && rightExtra}
              </View>
            )}
          </Row>
        </View>
      </TouchableHighlight>
    </View>
  );
};

/**
 * A spacer to be added at the bottom of the underlying scrolling container
 * to ensure that the CtaButton won't cover the last elements
 */
export const CtaButtonSpacer = () => {
  const { spacing } = useTheme();
  return <View style={{ height: spacing[20] }} />;
};

const createStyles = ({
  colors,
  shapes,
  spacing,
  fontSizes,
  fontWeights,
}: Theme) =>
  StyleSheet.create({
    container: {
      padding: spacing[4],
    },
    button: {
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      borderRadius: Platform.select({
        ios: shapes.lg,
        android: 60,
      }),
      alignItems: 'center',
      elevation: 9,
    },
    disabledButton: {
      backgroundColor: colors.secondaryText,
    },
    stack: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textStyle: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      textAlign: 'center',
      color: 'white',
    },
    icon: {
      marginVertical: -2,
      marginRight: spacing[2],
    },
    subtitle: {
      marginTop: spacing[2],
    },
    hint: {
      color: colors.caption,
      fontSize: fontSizes.xs,
      textAlign: 'center',
      paddingBottom: spacing[2],
    },
  });
