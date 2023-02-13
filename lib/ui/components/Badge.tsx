import { StyleSheet, Text, TextProps, View } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

interface Props {
  text: string;
  style?: TextProps['style'];
}

export const Badge = ({ text, style }: Props) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.orange[600],
        },
        style,
      ]}
    >
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

const createStyles = ({ fontSizes, fontWeights, shapes, spacing }: Theme) =>
  StyleSheet.create({
    badge: {
      borderRadius: shapes.lg,
      padding: spacing[2],
    },
    badgeText: {
      color: 'white',
      fontSize: fontSizes['2xs'],
      fontWeight: fontWeights.bold,
      textTransform: 'uppercase',
    },
  });
