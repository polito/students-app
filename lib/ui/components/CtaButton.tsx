import { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { shadeColor } from '@lib/ui/utils/colors';

import { TextWithLinks } from '../../../src/core/components/TextWithLinks';
import { useFeedbackContext } from '../../../src/core/contexts/FeedbackContext';
import { useSafeBottomBarHeight } from '../../../src/core/hooks/useSafeBottomBarHeight';

interface Props extends TouchableHighlightProps {
  containerStyle?: ViewStyle;
  icon?: any;
  absolute?: boolean;
  title: string;
  rightExtra?: JSX.Element;
  loading?: boolean;
  action: () => unknown | Promise<unknown>;
  variant?: 'filled' | 'outlined';
  destructive?: boolean;
  success?: boolean;
  hint?: string;
}

/**
 * A call-to-action button with in-place loading indicator.
 */
export const CtaButton = ({
  style,
  absolute = true,
  title,
  loading,
  disabled,
  destructive = false,
  success = false,
  action,
  icon,
  rightExtra,
  hint,
  containerStyle,
  variant = 'filled',
  ...rest
}: Props) => {
  const { palettes, colors, fontSizes, spacing, dark, fontWeights } =
    useTheme();
  const styles = useStylesheet(createStyles);
  const { left, right } = useSafeAreaInsets();
  const bottomBarHeight = useSafeBottomBarHeight();
  const { isFeedbackVisible } = useFeedbackContext();

  const outlined = variant === 'outlined';

  const underlayColor = useMemo(() => {
    if (variant === 'outlined') {
      if (dark) return shadeColor(colors.background, 20);
      else return shadeColor(colors.background, -10);
    } else {
      if (destructive) return palettes.danger[700];
      return palettes.primary[500];
    }
  }, [
    colors.background,
    dark,
    destructive,
    palettes.danger,
    palettes.primary,
    variant,
  ]);

  const color = useMemo(() => {
    if (success) {
      return dark ? palettes.success[400] : palettes.success[700];
    }
    if (destructive) return palettes.danger[600];
    return palettes.primary[400];
  }, [
    dark,
    destructive,
    palettes.danger,
    palettes.primary,
    palettes.success,
    success,
  ]);

  return (
    <View
      style={[
        styles.container,
        absolute && {
          position: 'absolute',
          left: Platform.select({ ios: left }),
          right,
          bottom: bottomBarHeight + (isFeedbackVisible ? spacing[20] : 0),
        },
        !!hint && { paddingTop: spacing[3] },
        containerStyle,
      ]}
    >
      {hint && (
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          <Text style={styles.hint}>{hint}</Text>
        </View>
      )}
      <TouchableHighlight
        accessibilityRole="button"
        underlayColor={underlayColor}
        disabled={disabled || loading}
        style={[
          styles.button,
          variant === 'outlined' && {
            borderColor: color,
            borderWidth: 1,
            backgroundColor: colors.background,
          },
          variant === 'filled' && {
            borderColor: color,
            borderWidth: 1,
            backgroundColor: color,
          },
          disabled && variant === 'filled' && styles.disabledButton,
          style,
        ]}
        accessibilityLabel={title}
        onPress={action}
        {...rest}
      >
        <View>
          <View style={styles.stack}>
            {loading && (
              <ActivityIndicator
                color={
                  outlined
                    ? destructive
                      ? palettes.danger[600]
                      : palettes.primary[500]
                    : 'white'
                }
              />
            )}
          </View>
          <Row style={{ opacity: loading ? 0 : 1 }}>
            {/* {!loading && ( */}
            {/*   <View style={{ marginHorizontal: spacing[1] }}>{icon}</View> */}
            {/* )} */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {icon && (
                <Icon
                  icon={icon}
                  size={fontSizes.xl}
                  color={variant === 'filled' ? colors.white : color}
                  style={{ marginRight: spacing[2] }}
                />
              )}
              <TextWithLinks
                style={[
                  styles.textStyle,
                  variant === 'outlined' && {
                    borderColor: palettes.primary[400],
                  },
                  {
                    color: variant === 'filled' ? colors.white : color,
                  },
                  disabled ? { color: colors.disableTitle } : undefined,
                ]}
                baseStyle={{ fontWeight: fontWeights.medium }}
              >
                {title}
              </TextWithLinks>
              {rightExtra && rightExtra}
            </View>
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

const createStyles = ({ colors, shapes, spacing, fontSizes }: Theme) =>
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
      borderColor: colors.secondaryText,
    },
    stack: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textStyle: {
      fontSize: fontSizes.md,
      textAlign: 'center',
      color: colors.white,
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
