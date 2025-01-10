import { View, ViewProps } from 'react-native';

import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { formatTime } from '../../utils/dates';

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
  return (
    <View
      style={{ padding: spacing[5] }}
      {...rest}
      accessible
      accessibilityRole="text"
      accessibilityLabel={[
        title,
        type,
        typeof time === 'string'
          ? `${time} ${endTime ? ` - ${formatTime(endTime)}` : ''}`
          : time,
        timeLabel,
      ].join(', ')}
    >
      <ScreenTitle style={{ marginBottom: spacing[2] }} title={title} />
      <Text
        accessible={false}
        variant="caption"
        style={{ marginBottom: spacing[2] }}
      >
        {type}
      </Text>
      {time &&
        (typeof time === 'string' ? (
          <Text accessible={false} style={{ fontSize: fontSizes.md }}>
            {time}
            {endTime && ` - ${formatTime(endTime)}`}
          </Text>
        ) : (
          time
        ))}
      {!!timeLabel && (
        <Text accessible={false} style={{ fontSize: fontSizes.md }}>
          {timeLabel}
        </Text>
      )}
    </View>
  );
};
