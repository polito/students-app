import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
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
  absolute?: boolean;
  title: string;
  loading?: boolean;
  success?: boolean;
  icon?: string;
  successMessage?: string;
  onSuccess?: () => void;
  destructive?: boolean;
}

export const CtaButton = ({
  style,
  adjustInsets = true,
  absolute = true,
  title,
  loading,
  success,
  successMessage,
  icon,
  onSuccess,
  destructive = false,
  ...rest
}: Props) => {
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const [showSuccess, setShowSuccess] = useState(false);
  let bottomBarHeight = 0;
  try {
    bottomBarHeight = useBottomTabBarHeight();
  } catch (e) {
    //
  }
  const position: Partial<ViewStyle> = absolute
    ? {
        position: 'absolute',
        bottom: 0,
        left: Platform.select({ ios: 0 }),
        right: 0,
      }
    : {};

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      onSuccess && onSuccess();
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }
  }, [success]);

  return (
    <View
      style={[
        {
          ...position,
          marginBottom: adjustInsets ? bottomBarHeight : undefined,
        },
        styles.container,
      ]}
    >
      <TouchableHighlight
        underlayColor={!destructive ? colors.primary[600] : colors.danger[600]}
        disabled={loading || showSuccess}
        style={[
          styles.button,
          {
            backgroundColor: !destructive
              ? colors.primary[500]
              : colors.danger[500],
          },
          style,
        ]}
        accessibilityLabel={title}
        {...rest}
      >
        <View>
          <View style={styles.stack}>
            {loading && <ActivityIndicator color="white" />}
          </View>
          <View style={{ opacity: loading ? 0 : 1 }}>
            {showSuccess ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  icon={faCheckCircle}
                  size={fontSizes.xl}
                  color="white"
                  style={styles.icon}
                />
                {successMessage && (
                  <Text style={styles.textStyle}>{successMessage}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.textStyle}>{title}</Text>
            )}
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const createStyles = ({ shapes, spacing, fontSizes, fontWeights }: Theme) =>
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
      elevation: 12,
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
  });
