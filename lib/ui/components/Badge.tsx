import { useMemo } from 'react';
import { StyleSheet, TextProps } from 'react-native';

import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { Text } from './Text';

interface Props {
  text: string | number;
  style?: TextProps['style'];
  variant?: 'outlined' | 'filled';
}

export const Badge = ({ text, style, variant = 'filled' }: Props) => {
  const { colors, palettes } = useTheme();
  const styles = useStylesheet(createStyles);

  const isOutlined = useMemo(() => variant === 'outlined', [variant]);
  return (
    <Row
      ph={1}
      align="center"
      justify="center"
      flexShrink={0}
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
    </Row>
  );
};

const createStyles = ({ fontSizes, fontWeights, shapes, spacing }: Theme) =>
  StyleSheet.create({
    badge: {
      borderRadius: shapes.xl,
      minWidth: 19,
      minHeight: 19,
    },
    badgeText: {
      color: 'white',
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      textTransform: 'uppercase',
    },
  });
