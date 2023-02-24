import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
} from 'react-native';

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

interface Props extends TouchableHighlightProps {
  adjustInsets?: boolean;
  icon?: any;
  absolute?: boolean;
  title: string;
  rightExtra?: JSX.Element;
  loading?: boolean;
  action: () => unknown | Promise<unknown>;
  successMessage?: string;
  destructive?: boolean;
  textExtra?: string;
}

/**
 * A call-to-action button with in-place async action feedback
 *
 * If `action` returns a Promise, its result will be used to show
 * a temporary success message before moving to the next state
 */
export const CtaButton = ({
  style,
  adjustInsets = true,
  absolute = true,
  title,
  loading,
  successMessage,
  disabled,
  destructive = false,
  action,
  icon,
  rightExtra,
  textExtra,
  ...rest
}: Props) => {
  const { colors, fontSizes, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const [showSuccess, setShowSuccess] = useState(false);
  const successMessageRef = useRef<string>();
  const destructiveRef = useRef<boolean>();
  let bottomBarHeight = 0;
  try {
    bottomBarHeight = useBottomTabBarHeight();
  } catch (e) {
    // Not available in this context
  }

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
        absolute && styles.absolute,
        !!textExtra && { paddingTop: spacing[3] },
        adjustInsets && { marginBottom: bottomBarHeight },
      ]}
    >
      {textExtra && (
        <View>
          <Text style={styles.textExtra}>{textExtra}</Text>
        </View>
      )}
      <TouchableHighlight
        underlayColor={
          (showSuccess ? destructiveRef.current : destructive)
            ? colors.danger[600]
            : colors.primary[600]
        }
        disabled={disabled || loading || showSuccess}
        style={[
          styles.button,
          {
            backgroundColor: (
              showSuccess ? destructiveRef.current : destructive
            )
              ? colors.danger[500]
              : colors.primary[500],
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
          <View style={{ opacity: loading ? 0 : 1, flexDirection: 'row' }}>
            {/* {!loading && ( */}
            {/*   <View style={{ marginHorizontal: spacing['1'] }}>{icon}</View> */}
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
                    color={colors.text[100]}
                    style={{ marginRight: spacing['2'] }}
                  />
                )}
                <Text style={styles.textStyle}>{title}</Text>
                {rightExtra && rightExtra}
              </View>
            )}
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
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
    textExtra: {
      fontSize: fontSizes.xs,
      color: colors.text['500'],
      paddingBottom: spacing[2],
      textAlign: Platform.select({ ios: 'center' }),
    },
    absolute: {
      position: 'absolute',
      bottom: 0,
      left: Platform.select({ ios: 0 }),
      right: 0,
    },
    button: {
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      borderRadius: Platform.select({
        ios: shapes.lg,
        android: 60,
      }),
      alignItems: 'center',
      elevation: 12,
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
  });
