import { useMemo } from 'react';

import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  accessible?: boolean;
  date?: string;
  time?: string;
  inListItem?: boolean;
  accessibilityLabel?: string;
}

export const ScreenDateTime = ({
  accessible,
  accessibilityLabel,
  date,
  time,
  inListItem = false,
}: Props) => {
  const { colors, dark, fontSizes, palettes } = useTheme();

  const color = useMemo(() => {
    if (!inListItem) return colors.prose;
    return dark ? palettes.gray[400] : palettes.gray[500];
  }, [colors.prose, dark, inListItem, palettes.gray]);

  return (
    <Row
      accessibilityLabel={accessibilityLabel}
      gap={3}
      accessible={accessible}
    >
      <Row gap={2} align="center">
        <Icon icon={faCalendar} color={color} size={fontSizes.md} />
        <Text style={{ fontSize: fontSizes.md, color }}>{date ?? ''}</Text>
      </Row>
      <Row gap={2} align="center">
        <Icon icon={faClock} color={color} size={fontSizes.md} />
        <Text style={{ fontSize: fontSizes.md, color }}>{time ?? ''}</Text>
      </Row>
    </Row>
  );
};
