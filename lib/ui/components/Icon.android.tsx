import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import { IconProps } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const Icon = ({ android, style, color, size }: IconProps) => {
  const { colors, fontSizes } = useTheme();
  return (
    <MaterialIcon
      name={android}
      color={color ?? colors.prose}
      style={style}
      size={size ?? fontSizes['2xl']}
    />
  );
};
