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
  destructive?: boolean;
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
  const { isFeedbackVisible } = useFeedbackContext();

  return (
    <View
      style={[
        styles.container,
        absolute && {
          position: 'absolute',
          left: Platform.select({ ios: left }),
          right,
          bottom: bottomBarHeight + (isFeedbackVisible ? spacing[16] : 0),
        },
        !!hint && { paddingTop: spacing[3] },
        containerStyle,
      ]}
    >
      {hint && <Text style={styles.hint}>{hint}</Text>}
      <TouchableHighlight
        accessibilityRole="button"
        underlayColor={
          destructive ? palettes.danger[700] : palettes.primary[600]
        }
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: destructive
              ? palettes.danger[600]
              : palettes.primary[500],
          },
          disabled && styles.disabledButton,
          style,
        ]}
        accessibilityLabel={title}
        onPress={action}
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
