import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  success?: boolean;
  icon?: string;
  successMessage?: string;
  onSuccess?: () => void;
}

export const CtaButton = ({
  style,
  title,
  loading,
  success,
  successMessage,
  icon,
  onSuccess,
  ...rest
}: Props) => {
  const { colors, spacing, shapes, fontSizes } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);

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
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading || showSuccess}
      style={[
        {
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[3],
          backgroundColor: colors.primary[500],
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
          <Icon
            name="checkmark-circle-outline"
            color={colors.trueGray[50]}
            size={fontSizes['2xl']}
            style={{ marginVertical: -2, marginRight: spacing[2] }}
          />
          {successMessage && (
            <Text
              style={{
                fontSize: fontSizes.md,
                textAlign: 'center',
                color: colors.trueGray[50],
              }}
            >
              {successMessage}
            </Text>
          )}
        </View>
      ) : (
        <Row>
          {icon && (
            <Icon
              name={icon}
              color={colors.trueGray[50]}
              size={fontSizes['2xl']}
              style={{ marginVertical: -2, marginRight: spacing[2] }}
            />
          )}
          <Text
            style={{
              fontSize: fontSizes.md,
              textAlign: 'center',
              color: colors.trueGray[50],
            }}
          >
            {title}
          </Text>
        </Row>
      )}
    </TouchableOpacity>
  );
};
