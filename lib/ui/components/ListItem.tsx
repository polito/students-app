import { View, Text, TouchableHighlight } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  title: string | JSX.Element;
  subtitle: string | JSX.Element;
  leadingItem?: JSX.Element;
  trailingItem?: JSX.Element;
}

export const ListItem = ({
  title,
  subtitle,
  leadingItem,
  trailingItem,
}: Props) => {
  const { fontSizes, colors, spacing } = useTheme();
  return (
    <TouchableHighlight
      underlayColor={colors.touchableHighlight}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[2],
      }}
    >
      <View>
        {leadingItem}
        <View style={{ flex: 1, flexDirection: 'column' }}>
          {typeof title === 'string' ? (
            <Text
              style={{
                fontSize: fontSizes.lg,
                color: colors.prose,
              }}
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <Text
              style={{
                fontSize: fontSizes.sm,
                color: colors.caption,
              }}
            >
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </View>
        {trailingItem}
      </View>
    </TouchableHighlight>
  );
};
