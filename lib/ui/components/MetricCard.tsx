import { Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Card, Props as CardProps } from './Card';

interface Props {
  name: string;
  value: string | JSX.Element;
}

/**
 * A card used to present a simple textual metric with a caption
 */
export const MetricCard = ({
  name,
  value,
  style,
  ...rest
}: CardProps & Props) => {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  return (
    <Card
      style={[
        {
          flex: 1,
          padding: spacing[5],
        },
        style,
      ]}
      {...rest}
    >
      <Text style={{ color: colors.secondaryText }}>{name}</Text>
      {typeof value === 'string' ? (
        <Text
          style={{
            color: colors.prose,
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.semibold,
          }}
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </Card>
  );
};
