import {
  Platform,
  StyleProp,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';

import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
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
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  isNavigationAction?: boolean;
}

/**
 * A list item with support for a title, subtitle, leading and trailing
 * elements. If a linkTo is provided, a forward icon is automatically
 * displayed as a trailing element on iOS.
 */
export const ListItem = ({
  title,
  titleStyle,
  subtitle,
  subtitleStyle,
  leadingItem,
  trailingItem,
  linkTo,
  containerStyle,
  onPress,
  isNavigationAction,
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
            minHeight: 56,
          },
          containerStyle,
        ]}
      >
        {leadingItem && (
          <View
            style={{
              width: 38,
              height: 38,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -7,
              marginRight: spacing[2],
            }}
          >
            {leadingItem}
          </View>
        )}
        <View style={{ flex: 1 }}>
          {typeof title === 'string' ? (
            <Text
              variant="title"
              style={[
                {
                  fontSize: fontSizes.md,
                  lineHeight: fontSizes.md * 1.5,
                },
                titleStyle,
              ]}
              weight="normal"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {subtitle ? (
            typeof subtitle === 'string' ? (
              <Text
                variant="secondaryText"
                style={[
                  {
                    fontSize: fontSizes.sm,
                    lineHeight: fontSizes.sm * 1.5,
                    height: 18,
                  },
                  subtitleStyle,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {subtitle}
              </Text>
            ) : (
              subtitle
            )
          ) : null}
        </View>
        {!trailingItem &&
        (linkTo || isNavigationAction) &&
        Platform.OS === 'ios' ? (
          <Icon
            icon={faChevronRight}
            color={colors.secondaryText}
            style={{
              marginLeft: spacing[1],
              marginRight: -spacing[1],
            }}
          />
        ) : (
          trailingItem
        )}
      </View>
    </TouchableHighlight>
  );
};
