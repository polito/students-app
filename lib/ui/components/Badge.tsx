import { useMemo } from 'react';
import { StyleSheet, Text, TextProps, View } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface Props {
  text: string;
  style?: TextProps['style'];
  variant?: 'outlined' | 'filled';
}

export const Badge = ({ text, style, variant = 'filled' }: Props) => {
  const { colors, palettes } = useTheme();
  const styles = useStylesheet(createStyles);

  const isOutlined = useMemo(() => variant === 'outlined', [variant]);
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palettes.orange[600],
        },
        isOutlined && {
          backgroundColor: colors.surface,
          borderColor: palettes.orange[600],
          borderWidth: 2,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isOutlined && { color: palettes.orange[600] },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const createStyles = ({ fontSizes, fontWeights, shapes, spacing }: Theme) =>
  StyleSheet.create({
    badge: {
      borderRadius: shapes.xl,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
    badgeText: {
      color: 'white',
      fontSize: fontSizes['2xs'],
      fontWeight: fontWeights.bold,
      textTransform: 'uppercase',
    },
  });
