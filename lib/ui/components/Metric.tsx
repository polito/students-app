import { View, ViewProps } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { CardProps } from './Card';
import { Text, Props as TextProps } from './Text';

type Props = ViewProps & {
  title?: string;
  value: string | number | JSX.Element;
  color?: string;
  valueStyle?: TextProps['style'];
};

/**
 * A view used to present a simple textual metric
 */
export const Metric = ({ title, value, color, ...rest }: CardProps & Props) => {
  const { dark, palettes, fontSizes, fontWeights } = useTheme();

  return (
    <View {...rest}>
      {title && <Text accessible={false}>{title}</Text>}
      {['string', 'number'].includes(typeof value) ? (
        <Text
          accessible={false}
          style={[
            {
              color: color ?? palettes.secondary[dark ? 500 : 600],
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
