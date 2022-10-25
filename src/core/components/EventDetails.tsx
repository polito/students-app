import { View } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  title: string;
  type: string;
  time?: Date;
  timeLabel?: string;
}

export const EventDetails = ({ title, type, time, timeLabel }: Props) => {
  const { spacing, fontSizes, colors } = useTheme();
  return (
    <>
      <View style={{ padding: spacing[5] }}>
        <Text variant="heading" style={{ marginBottom: spacing[2] }}>
          {title}
        </Text>
        <Text
          variant="caption"
          weight={'light'}
          uppercase
          style={{ marginBottom: spacing[2], color: colors.primary[300] }}
        >
          {type}
        </Text>
        {time && (
          <Text style={{ fontSize: fontSizes.md }}>
            {time.toLocaleString()}
          </Text>
        )}
        {timeLabel && (
          <Text style={{ fontSize: fontSizes.md, textTransform: 'capitalize' }}>
            {timeLabel}
          </Text>
        )}
      </View>
    </>
  );
};
