import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';

type Props = {
  text: string;
  icon?: IconDefinition;
  backgroundColor: string;
  foregroundColor: string;
};

export const Badge = ({
  text,
  icon,
  backgroundColor,
  foregroundColor,
}: Props) => {
  const { spacing, shapes, fontSizes } = useTheme();
  const { accessibility } = usePreferencesContext();
  return (
    <Row
      accessible={true}
      accessibilityLabel={text}
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
