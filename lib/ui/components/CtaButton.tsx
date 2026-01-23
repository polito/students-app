import { ReactElement, ReactNode, useMemo } from 'react';
import {
  ColorValue,
  Platform,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { shadeColor } from '@lib/ui/utils/colors';

import { RTFTrans } from '../../../src/core/components/RTFTrans';
import { useFeedbackContext } from '../../../src/core/contexts/FeedbackContext';
import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';
import { useSafeBottomBarHeight } from '../../../src/core/hooks/useSafeBottomBarHeight';

interface BaseProps extends PressableProps {
  containerStyle?: ViewStyle;
  icon?: any;
  absolute?: boolean;
  rightExtra?: ReactElement;
  loading?: boolean;
  action: () => unknown | Promise<unknown>;
  variant?: 'filled' | 'outlined';
  destructive?: boolean;
  success?: boolean;
  hint?: string;
  textStyle?: TextStyle;
  underlayColor?: ColorValue;
}

/**
 * **Children Mode**
 * * Use this mode when you need full control over the button's internal content.
 * Useful for passing raw strings, multiple text components, or custom layouts.
 * * @example
 * <CtaButton action={...}>
 * <TextWitLink>Custom Label</TextWitLink>
 * </CtaButton>
 */

interface ChildrenProps extends BaseProps {
  children: ReactNode;
  tkey?: never;
  tvalues?: never;
  tstyles?: never;
  title?: never;
}

/**
 * **Translation Mode**
 * * Use this mode to automatically handle internationalization.
 * The component will render an `<RTFTrans />` component internally.
 * * @example
 * <CtaButton
 * action={...}
 * tkey="auth.login.submit"
 * tvalues={{ name: 'John' }}
 * />
 */

interface TranslationProps extends BaseProps {
  children?: never;
  tkey: string;
  tvalues?: Record<string, any>;
  tstyles?: StyleProp<TextStyle>;
  title?: never;
}

type Props = ChildrenProps | TranslationProps;

function isChildrenProps(props: Props): props is ChildrenProps {
  return 'children' in props && props.children !== undefined;
}

/**
 * A call-to-action button with in-place loading indicator.
 */
export const CtaButton = ({
  style,
  absolute = true,
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
  textStyle,
  ...rest
}: Props) => {
  const props = rest as Props;

  const { palettes, colors, fontSizes, spacing, dark, fontWeights } =
    useTheme();
  const styles = useStylesheet(createStyles);
  const { left, right } = useSafeAreaInsets();
  const bottomBarHeight = useSafeBottomBarHeight();
  const { isFeedbackVisible } = useFeedbackContext();
  const { accessibility } = usePreferencesContext();

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

  const computedTextStyle = [
    styles.textStyle,
    variant === 'outlined' && {
      borderColor: palettes.primary[400],
    },
    {
      color: variant === 'filled' ? colors.white : color,
      fontWeight: fontWeights.medium,
    },
    disabled ? { color: success ? color : colors.disableTitle } : undefined,
    textStyle,
  ] as StyleProp<TextStyle>;

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
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          variant === 'outlined' && {
            borderColor: color,
            borderWidth: 1,
            backgroundColor: pressed ? underlayColor : colors.background,
          },
          variant === 'filled' && {
            borderColor: color,
            borderWidth: 1,
            backgroundColor: pressed ? underlayColor : color,
          },
          disabled && variant === 'filled' && styles.disabledButton,
          typeof style === 'function'
            ? (
                style as (
                  state: PressableStateCallbackType,
                ) => StyleProp<ViewStyle>
              )({
                pressed,
              })
            : style,
        ]}
        accessibilityLabel={isChildrenProps(props) ? undefined : props.tkey}
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon && Number(accessibility?.fontSize) < 150 && (
              <Icon
                icon={icon}
                size={fontSizes.xl}
                color={variant === 'filled' ? colors.white : color}
                style={{ marginRight: spacing[2] }}
              />
            )}
            {isChildrenProps(props) ? (
              props.children
            ) : (
              <RTFTrans
                i18nKey={props.tkey}
                values={props.tvalues}
                style={[computedTextStyle, props.tstyles]}
              />
            )}
            {rightExtra && rightExtra}
          </View>
        </View>
      </Pressable>
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
