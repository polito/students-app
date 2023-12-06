import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextProps } from 'react-native';

import { Row } from '@lib/ui/components/Row';
import { VisuallyHidden } from '@lib/ui/components/VisuallyHidden';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { isNumber } from 'lodash';

import { Text } from './Text';

interface Props {
  text?: string | number;
  style?: TextProps['style'];
  variant?: 'outlined' | 'filled';
}

export const UnreadBadge = ({ text, style, variant = 'filled' }: Props) => {
  const { t } = useTranslation();
  const { colors, palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const isOutlined = useMemo(() => variant === 'outlined', [variant]);
  const isNumeric = isNumber(text);

  return (
    <Row
      ph={1}
      align="center"
      justify="center"
      flexShrink={0}
      style={[
        styles.badge,
        {
          backgroundColor: isNumeric
            ? palettes.rose[600]
            : palettes.orange[600],
        },
        !text && styles.dotBadge,
        isOutlined && {
          backgroundColor: colors.surface,
          borderColor: isNumeric ? palettes.rose[600] : palettes.orange[600],

          borderWidth: 2,
        },
        style,
      ]}
    >
      {text && (
        <Text
          style={[
            styles.badgeText,
            isOutlined && { color: palettes.orange[600] },
          ]}
        >
          {text}
          {isNumeric && (
            <VisuallyHidden>
              {t('common.newItems', { count: Number(text) })}
            </VisuallyHidden>
          )}
        </Text>
      )}
    </Row>
  );
};

const createStyles = ({ fontSizes, fontWeights, shapes, palettes }: Theme) =>
  StyleSheet.create({
    badge: {
      borderRadius: shapes.xl,
      minWidth: 19,
      minHeight: 19,
    },
    dotBadge: {
      minWidth: 12,
      minHeight: 12,
      backgroundColor: palettes.rose[600],
    },
    badgeNumber: {
      backgroundColor: palettes.rose[600],
    },
    badgeText: {
      color: 'white',
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      textTransform: 'uppercase',
    },
  });
