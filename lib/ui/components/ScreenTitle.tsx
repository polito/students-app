import { TextProps, View, ViewStyle } from 'react-native';

import { Separator } from './Separator';
import { Text } from './Text';

interface Props {
  title: string;
  style?: ViewStyle;
  ellipsizeTitle?: boolean;
}

/**
 * The title of a screen, when it needs to convey more info than the one into the header
 */
export const ScreenTitle = ({
  title,
  style,
  ellipsizeTitle = false,
}: Props) => {
  const ellipsis: Partial<TextProps> = ellipsizeTitle
    ? {
        numberOfLines: 1,
        ellipsizeMode: 'tail',
      }
    : {};

  return (
    <View style={style}>
      <Separator />
      <Text variant="title" role="heading" {...ellipsis}>
        {title}
      </Text>
    </View>
  );
};
