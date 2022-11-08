import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

import { faCheck } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props extends TouchableOpacityProps {
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
        left: 0,
        right: 0,
        marginBottom: Platform.select({ ios: 80 }),
        padding: spacing[4],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={loading || showSuccess}
        style={[
          {
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[4],
            backgroundColor: !destructive
              ? colors.primary[500]
              : colors.error[500],
            borderRadius: shapes.lg,
            alignItems: 'center',
          },
          style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator />
        ) : showSuccess ? (
          <View style={{ flexDirection: 'row' }}>
            <FontAwesomeIcon
              icon={faCheck}
              color={colors.prose}
              size={fontSizes.xl}
              style={{ marginVertical: -2, marginRight: spacing[2] }}
            />
            {successMessage && (
              <Text
                style={{
                  fontSize: fontSizes.md,
                  textAlign: 'center',
                  height: 20,
                }}
              >
                {successMessage}
              </Text>
            )}
          </View>
        ) : (
          <Text
            style={{ fontSize: fontSizes.md, textAlign: 'center', height: 20 }}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
