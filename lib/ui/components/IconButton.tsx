import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { Props as FAProps } from '@fortawesome/react-native-fontawesome';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

type Props = Omit<FAProps, 'style'> &
  TouchableOpacityProps & {
    iconStyle?: FAProps['style'];
    adjustSpacing?: 'left' | 'right' | 'both';
  };

export const IconButton = ({ iconStyle, adjustSpacing, ...rest }: Props) => {
  const { spacing } = useTheme();
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
  return (
    <TouchableOpacity
      style={[{ padding: spacing[2] }, style]}
      {...otherButtonProps}
    >
      <Icon
        style={[
          {
            marginLeft:
              adjustSpacing === 'left' || adjustSpacing === 'both'
                ? -spacing[2]
                : undefined,
            marginRight:
              adjustSpacing === 'right' || adjustSpacing === 'both'
                ? -spacing[2]
                : undefined,
          },
          iconStyle,
        ]}
        {...iconProps}
      />
    </TouchableOpacity>
  );
};
