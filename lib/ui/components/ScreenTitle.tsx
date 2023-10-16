import { TextProps, View, ViewStyle } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { Separator } from './Separator';
import { Text } from './Text';

interface Props {
  title?: string;
  style?: ViewStyle;
  ellipsizeTitle?: boolean;
  padded?: boolean;
}

/**
 * The title of a screen, when it needs to convey more info than the one into the header
 */
export const ScreenTitle = ({
  title,
  style,
  ellipsizeTitle = false,
  padded = false,
}: Props) => {
  const { spacing } = useTheme();
  const ellipsis: Partial<TextProps> = ellipsizeTitle
    ? {
        numberOfLines: 1,
        ellipsizeMode: 'tail',
      }
    : {};

  return (
    <View style={[padded ? { paddingHorizontal: spacing[5] } : {}, style]}>
      <Separator />
      <Text variant="title" role="heading" {...ellipsis}>
        {title ?? ''}
      </Text>
    </View>
  );
};
