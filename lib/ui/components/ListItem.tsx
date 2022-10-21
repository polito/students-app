import {
  Platform,
  StyleProp,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

interface Props {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  leadingItem?: JSX.Element;
  trailingItem?: JSX.Element;
  linkTo?: To<any>;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * A list item with support for a title, subtitle, leading and trailing
 * elements. If a linkTo is provided, a forward icon is automatically
 * displayed as a trailing element on iOS.
 */
export const ListItem = ({
  title,
  subtitle,
  leadingItem,
  trailingItem,
  linkTo,
  containerStyle,
  onPress,
  ...rest
}: TouchableHighlightProps & Props) => {
  const { fontSizes, colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <TouchableHighlight
      underlayColor={colors.touchableHighlight}
      onPress={
        linkTo
          ? () => {
              navigation.navigate({
                name: typeof linkTo === 'string' ? linkTo : linkTo.screen,
                params:
                  typeof linkTo === 'object' && 'params' in linkTo
                    ? linkTo.params
                    : undefined,
              });
            }
          : onPress
      }
      {...rest}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[2],
          },
          containerStyle,
        ]}
      >
        {leadingItem}
        <View style={{ flex: 1 }}>
          {typeof title === 'string' ? (
            <Text
              variant="title"
              style={{
                fontSize: fontSizes.md,
                lineHeight: fontSizes.md * 1.5,
              }}
              weight="normal"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <Text
              variant="secondaryText"
              style={{
                fontSize: fontSizes.sm,
                lineHeight: fontSizes.sm * 1.5,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </View>
        {linkTo && Platform.OS === 'ios' ? (
          <Icon
            name="chevron-forward-outline"
            color={colors.secondaryText}
            size={fontSizes['2xl']}
            style={{ marginRight: -spacing[1] }}
          />
        ) : (
          trailingItem
        )}
      </View>
    </TouchableHighlight>
  );
};
