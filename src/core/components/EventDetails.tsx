import { View } from 'react-native';

import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  title: string;
  type: string;
  time: string;
}

export const EventDetails = ({ title, type, time }: Props) => {
  const { spacing, fontSizes } = useTheme();
  return (
    <>
      <View style={{ padding: spacing[5] }}>
        <ScreenTitle style={{ marginBottom: spacing[2] }} title={title} />
        <Text variant="caption" style={{ marginBottom: spacing[2] }}>
          {type}
        </Text>
        {time && <Text style={{ fontSize: fontSizes.md }}>{time}</Text>}
      </View>
    </>
  );
};
