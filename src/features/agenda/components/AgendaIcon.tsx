import { View } from 'react-native';

import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { courseIcons } from '../../teaching/constants';

interface Props {
  color: string;
  icon?: string;
}

export const AgendaIcon = ({ color, icon }: Props) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: color ?? colors.primary[400],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon && <Icon icon={courseIcons[icon]} color="white" size={12} />}
    </View>
  );
};
