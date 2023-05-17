import {
  StyleProp,
  TextProps,
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
import { GlobalStyles } from '../../../src/core/styles/GlobalStyles';
import { resolveLinkTo } from '../../../src/utils/resolveLinkTo';
import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

export interface ListItemProps extends TouchableHighlightProps {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  leadingItem?: JSX.Element;
  trailingItem?: JSX.Element;
  linkTo?: To<any>;
  children?: any;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  isAction?: boolean;
  card?: boolean;
  inverted?: boolean;
  titleProps?: TextProps;
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
  isAction,
  disabled,
  style,
  card,
  children,
  inverted = false,
  titleProps,
  ...rest
}: ListItemProps) => {
  const { fontSizes, colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const titleElement =
    typeof title === 'string' ? (
      <Text
        variant="title"
        style={[
          {
            fontSize: fontSizes.md,
          },
          titleStyle,
        ]}
        weight="normal"
        numberOfLines={card ? 2 : 1}
        ellipsizeMode="tail"
        {...titleProps}
      >
        {title}
      </Text>
    ) : (
      title
    );

  const subtitleElement = subtitle ? (
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
  ) : null;

  return (
    <TouchableHighlight
      underlayColor={colors.touchableHighlight}
      onPress={
        linkTo
          ? () => {
              navigation.navigate(resolveLinkTo(linkTo));
            }
          : onPress
      }
      style={[
        {
          opacity: disabled ? 0.5 : 1,
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
            flexDirection: card ? 'column' : 'row',
            alignItems: 'center',
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[2],
          },
          containerStyle,
        ]}
      >
        {children}
        {leadingItem && (
          <View
            style={{
              width: 38,
              height: 38,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: card ? undefined : -7,
              marginRight: card ? undefined : spacing[2],
            }}
          >
            {leadingItem}
          </View>
        )}
        <View style={GlobalStyles.grow}>
          {!inverted ? (
            <>
              {titleElement}
              {subtitleElement}
            </>
          ) : (
            <>
              {subtitleElement}
              {titleElement}
            </>
          )}
        </View>
        {!card &&
          (!trailingItem && (linkTo || isAction) && IS_IOS ? (
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
          ))}
      </View>
    </TouchableHighlight>
  );
};
