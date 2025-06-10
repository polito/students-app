import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextProps } from 'react-native';

import { Row } from '@lib/ui/components/Row';
import { VisuallyHidden } from '@lib/ui/components/VisuallyHidden';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { isNumber } from 'lodash';

import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';
import { Text } from './Text';

interface Props {
  text?: string | number;
  style?: TextProps['style'];
  variant?: 'outlined' | 'filled';
  isNumeric?: boolean;
}

export const UnreadBadge = ({
  text,
  style,
  variant = 'filled',
  isNumeric = false,
}: Props) => {
  const { t } = useTranslation();
  const { colors, palettes, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const isOutlined = useMemo(() => variant === 'outlined', [variant]);
  const isDigit = isNumber(text);
  const [styless, setStyless] = useState();
  const { accessibility } = usePreferencesContext();

  useEffect(() => {
    const changeStyle = () => {
      setStyless({
        marginTop:
          accessibility?.fontSize && accessibility.fontSize > 125
            ? -spacing[3]
            : 0,
      } as any);
    };
    changeStyle();
  }, [spacing, accessibility]);
  return (
    <Row
      ph={1}
      align="center"
      justify="center"
      flexShrink={0}
      style={[
        styles.badge,
        {
          backgroundColor:
            isDigit || isNumeric ? palettes.rose[600] : palettes.orange[600],
        },
        !text && styles.dotBadge,
        isOutlined && {
          backgroundColor: colors.surface,
          borderColor:
            isDigit || isNumeric ? palettes.rose[600] : palettes.orange[600],

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
            styless,
          ]}
        >
          {text}
          {isDigit && (
            <VisuallyHidden>
              {t('common.newItems', { count: Number(text) })}
            </VisuallyHidden>
          )}
        </Text>
      )}
    </Row>
  );
};

const createStyles = ({ fontSizes, fontWeights, shapes, palettes }: Theme) => {
  return StyleSheet.create({
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
    // Theme-independent hardcoded color
    // eslint-disable-next-line react-native/no-color-literals
    badgeText: {
      color: 'white',
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      textTransform: 'uppercase',
    },
  });
};
