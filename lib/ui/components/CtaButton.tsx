import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
} from 'react-native';

import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props extends TouchableHighlightProps {
  title: string;
  loading?: boolean;
  success?: boolean;
  successMessage?: string;
  destructive?: boolean;
}

export const CtaButton = ({
  style,
  title,
  loading,
  success,
  successMessage,
  destructive = false,
  ...rest
}: Props) => {
  const { colors, spacing, shapes, fontSizes } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  }, [success]);

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: Platform.select({ ios: 0 }),
        right: 0,
        marginBottom: Platform.select({ ios: 80 }),
        padding: spacing[4],
        elevation: 12,
      }}
    >
      <TouchableHighlight
        underlayColor={!destructive ? colors.primary[600] : colors.danger[600]}
        disabled={loading || showSuccess}
        style={[
          {
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[4],
            backgroundColor: !destructive
              ? colors.primary[500]
              : colors.danger[500],
            borderRadius: Platform.select({
              ios: shapes.lg,
              android: 60,
            }),
            alignItems: 'center',
          },
          style,
        ]}
        accessibilityLabelledBy="title"
        {...rest}
      >
        <View>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading && <ActivityIndicator color="white" />}
          </View>
          <View style={{ opacity: loading ? 0 : 1 }}>
            {showSuccess ? (
              <View style={{ flexDirection: 'row' }}>
                <Icon
                  icon={faCheckCircle}
                  size={fontSizes.xl}
                  color="white"
                  style={{ marginVertical: -2, marginRight: spacing[2] }}
                />
                {successMessage && (
                  <Text
                    style={{
                      fontSize: fontSizes.md,
                      textAlign: 'center',
                      height: 20,
                      color: 'white',
                    }}
                  >
                    {successMessage}
                  </Text>
                )}
              </View>
            ) : (
              <Text
                nativeID="title"
                style={{
                  fontSize: fontSizes.md,
                  textAlign: 'center',
                  height: 20,
                  color: 'white',
                }}
              >
                {title}
              </Text>
            )}
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
};
