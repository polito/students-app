import { PropsWithChildren } from 'react';
import {
  StyleProp,
  TouchableHighlight,
  TouchableHighlightProps,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { Card } from '@lib/ui/components/Card';
import { useTheme } from '@lib/ui/hooks/useTheme';

type Props = PropsWithChildren<
  ViewProps &
    TouchableHighlightProps & {
      /**
       * Toggles the rounded corners
       */
      rounded?: boolean;
      cardStyle?: StyleProp<ViewStyle>;
    }
>;

export const TouchableCard = ({
  children,
  style,
  cardStyle,
  rounded = true,
  ...rest
}: Props) => {
  const { shapes } = useTheme();

  return (
    <TouchableHighlight
      style={[{ borderRadius: rounded ? shapes.lg : undefined }, style]}
      {...rest}
    >
      <Card style={cardStyle}>{children}</Card>
    </TouchableHighlight>
  );
};
