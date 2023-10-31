import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

export type BookingDetailProps = {
  icon: IconProp;
  label: string;
  value?: string;
  emptyText?: string;
};

export const BookingField = ({
  icon,
  label,
  value,
  emptyText,
}: BookingDetailProps) => {
  const { palettes } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  return (
    <Col flex={1} style={styles.container} accessible>
      <Row align="center">
        <Icon icon={icon} color={palettes.primary['500']} size={14} />
        <Text style={styles.text}>{label}</Text>
      </Row>
      <Row mt={0.5}>
        {value ? (
          <Text style={StyleSheet.compose(styles.value, styles.withValue)}>
            {value}
          </Text>
        ) : (
          <Text
            numberOfLines={1}
            style={StyleSheet.compose(styles.empty, styles.value)}
          >
            {emptyText || t('common.noValue')}
          </Text>
        )}
      </Row>
    </Col>
  );
};

const createStyles = ({
  colors,
  fontSizes,
  fontWeights,
  spacing,
  shapes,
}: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: spacing[2],
      borderRadius: shapes.md,
    },
    value: {
      fontSize: fontSizes.sm,
    },
    withValue: {
      fontWeight: fontWeights.medium,
    },
    text: {
      fontSize: fontSizes.sm,
      marginLeft: spacing[1],
    },
    empty: {
      opacity: 0.6,
    },
  });
