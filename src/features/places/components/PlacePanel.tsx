import { View } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  placeId: number;
}

export const PlacePanel = ({ placeId }: Props) => {
  const { spacing, fontSizes } = useTheme();

  return (
    <View style={{ paddingHorizontal: spacing[5] }}>
      <Text variant="heading" style={{ marginBottom: spacing[2] }}>
        Aula 1
      </Text>
      <Text variant="caption" style={{ marginBottom: spacing[2] }}>
        Aula
      </Text>
      <Text style={{ fontSize: fontSizes.md }}>
        Corso Duca degli Abruzzi, 24, 10129, Torino
      </Text>
    </View>
  );
};
