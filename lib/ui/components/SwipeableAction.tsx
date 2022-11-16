import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

import { Props as FAProps } from '@fortawesome/react-native-fontawesome';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  icon?: FAProps['icon'];
  backgroundColor?: string;
  label: string;
}

export const SwipeableAction = ({
  icon,
  label,
  backgroundColor,
  ...rest
}: Props & TouchableOpacityProps) => {
  const { spacing } = useTheme();
  return (
    <TouchableOpacity {...rest}>
      <View
        style={{
          width: 75,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
        }}
      >
        {icon && <Icon icon={icon} />}
        <Text style={{ color: 'white', marginTop: spacing[1] }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};
