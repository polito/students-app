import { View, ViewProps } from 'react-native';

import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { dateFormatter } from '../../utils/dates';

type Props = ViewProps & {
  title?: string;
  type?: string;
  time?: string | JSX.Element;
  endTime?: Date;
  timeLabel?: string;
};

export const EventDetails = ({
  endTime,
  title,
  type,
  time,
  timeLabel,
  ...rest
}: Props) => {
  const { spacing, fontSizes } = useTheme();
  const formatHHmm = dateFormatter('HH:mm');
  return (
    <View style={{ padding: spacing[5] }} {...rest}>
      <ScreenTitle style={{ marginBottom: spacing[2] }} title={title} />
      <Text variant="caption" style={{ marginBottom: spacing[2] }}>
        {type}
      </Text>
      {time &&
        (typeof time === 'string' ? (
          <Text style={{ fontSize: fontSizes.md }}>
            {time}
            {endTime && ` - ${formatHHmm(endTime)}`}
          </Text>
        ) : (
          time
        ))}
      {!!timeLabel && (
        <Text style={{ fontSize: fontSizes.md }}>{timeLabel}</Text>
      )}
    </View>
  );
};
