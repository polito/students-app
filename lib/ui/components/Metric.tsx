import { View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { Props as CardProps } from './Card';
import { Text, Props as TextProps } from './Text';

interface Props {
  title: string;
  value: string | number | JSX.Element;
  color?: string;
  valueStyle?: TextProps['style'];
}

/**
 * A view used to present a simple textual metric
 */
export const Metric = ({ title, value, color, ...rest }: CardProps & Props) => {
  const { colors, fontSizes, fontWeights } = useTheme();

  return (
    <View {...rest}>
      <Text>{title}</Text>
      {['string', 'number'].includes(typeof value) ? (
        <Text
          style={[
            {
              color: color ?? colors.secondary[500],
              fontSize: fontSizes.lg,
              fontWeight: fontWeights.semibold,
            },
            rest.valueStyle,
          ]}
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
};
