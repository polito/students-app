import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  success?: boolean;
  successMessage?: string;
}

export const CtaButton = ({
  style,
  title,
  loading,
  success,
  successMessage,
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
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading || showSuccess}
      style={[
        {
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[3],
          backgroundColor: colors.primary[600],
          borderRadius: shapes.lg,
          alignItems: 'center',
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator style={{ marginVertical: 1 }} />
      ) : showSuccess ? (
        <View style={{ flexDirection: 'row' }}>
          <Ionicons
            name="checkmark-circle-outline"
            color={colors.prose}
            size={fontSizes['2xl']}
            style={{ marginVertical: -2, marginRight: spacing[2] }}
          />
          {successMessage && (
            <Text style={{ fontSize: fontSizes.md, textAlign: 'center' }}>
              {successMessage}
            </Text>
          )}
        </View>
      ) : (
        <Text style={{ fontSize: fontSizes.md, textAlign: 'center' }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
