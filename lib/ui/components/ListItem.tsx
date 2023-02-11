import {
  StyleProp,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { IS_IOS } from '../../../src/core/constants';
import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

export interface ListItemProps extends TouchableHighlightProps {
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
  disabled,
  style,
  ...rest
}: ListItemProps) => {
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
      style={[
        {
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <View
        style={[
          {
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[2],
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
                    marginTop: spacing[0.5],
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
        {!trailingItem && (linkTo || isNavigationAction) && IS_IOS ? (
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
