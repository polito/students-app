import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { Props as FAProps } from '@fortawesome/react-native-fontawesome';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

type Props = Omit<FAProps, 'style'> &
  TouchableOpacityProps & {
    iconStyle?: FAProps['style'];
  };

export const IconButton = ({ iconStyle, ...rest }: Props) => {
  const {
    icon,
    height,
    width,
    size,
    color,
    secondaryColor,
    secondaryOpacity,
    mask,
    maskId,
    transform,
    testID,
    ...buttonProps
  } = rest;
  const { style, ...otherButtonProps } = buttonProps;
  const iconProps = {
    icon,
    height,
    width,
    size,
    color,
    secondaryColor,
    secondaryOpacity,
    mask,
    maskId,
    transform,
    testID,
  };
  const { spacing } = useTheme();
  return (
    <TouchableOpacity
      style={[{ padding: spacing[2] }, style]}
      {...otherButtonProps}
    >
      <Icon style={iconStyle} {...iconProps} />
    </TouchableOpacity>
  );
};
