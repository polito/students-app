import { View } from 'react-native';
import { SFSymbol } from 'react-native-sfsymbols';

import { IconProps } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const Icon = ({ ios, style, color, size }: IconProps) => {
  const { colors, fontSizes } = useTheme();
  return (
    <View>
      <SFSymbol
        name={ios}
        color={color ?? colors.prose}
        style={[
          style,
          {
            height: 40,
            width: 40,
          },
        ]}
        size={size ?? fontSizes['2xl']}
      />
    </View>
  );
};
