import { View } from 'react-native';

import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { courseIcons } from '../constants';

interface Props {
  color?: string;
  icon?: string;
}

export const CourseIcon = ({ color, icon }: Props) => {
  const { palettes } = useTheme();
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: color ?? palettes.primary[400],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon && icon in courseIcons && (
        <Icon icon={courseIcons[icon]} color="white" />
      )}
    </View>
  );
};
