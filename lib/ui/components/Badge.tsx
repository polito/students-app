import { useTranslation } from 'react-i18next';
import { ViewProps } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { usePreferencesContext } from '~/core/contexts/PreferencesContext.ts';

type Props = ViewProps & {
  text: string;
  icon?: IconDefinition;
  backgroundColor: string;
  foregroundColor: string;
  /**
   * If true, the badge represents an unread count and accessibility
   * will announce it as "X new items".
   */
  isUnreadCount?: boolean;
};

export const Badge = ({
  text,
  icon,
  backgroundColor,
  foregroundColor,
  style,
  isUnreadCount = false,
  accessibilityLabel: customAccessibilityLabel,
}: Props) => {
  const { t } = useTranslation();
  const { spacing, shapes, fontSizes } = useTheme();
  const { accessibility } = usePreferencesContext();

  // For unread counts, create a more descriptive label
  const accessibilityLabel =
    customAccessibilityLabel ??
    (isUnreadCount
      ? t('common.newItems', { count: Number.parseInt(text, 10) || 0 })
      : text);

  return (
    <Row
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={isUnreadCount ? 'text' : undefined}
      gap={2}
      style={[
        {
          backgroundColor: backgroundColor,
          paddingLeft: spacing[1.5],
          paddingRight: spacing[2],
          paddingVertical: spacing[1],
          borderRadius: shapes.xl,
        },
        accessibility?.fontSize &&
          accessibility.fontSize >= 150 && {
            alignSelf: 'flex-start',
          },
        !icon && {
          paddingRight: spacing[1.5],
        },
        style,
      ]}
    >
      {icon && <Icon icon={icon} size={fontSizes.md} color={foregroundColor} />}
      <Text
        style={{ color: foregroundColor, fontSize: fontSizes.xs }}
        weight="medium"
      >
        {text}
      </Text>
    </Row>
  );
};
