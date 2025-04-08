import {
  StyleProp,
  TextProps,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { IS_IOS } from '../../../src/core/constants';
import { GlobalStyles } from '../../../src/core/styles/GlobalStyles';
import { resolveLinkTo } from '../../../src/utils/resolveLinkTo';
import { useTheme } from '../hooks/useTheme';
import { DisclosureIndicator } from './DisclosureIndicator';
import { Text } from './Text';

export interface ListItemProps extends TouchableHighlightProps {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  subtitleProps?: TextProps;
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
  multilineTitle?: boolean;
  unread?: boolean;
  isInVisibleRange?: boolean;
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
  subtitleProps,
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
  multilineTitle = false,
  titleProps,
  unread = false,
  ...rest
}: ListItemProps) => {
  const { fontSizes, fontWeights, colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const titleElement =
    typeof title === 'string' ? (
      <Row align="center" gap={2}>
        {unread && <UnreadBadge />}
        <Text
          variant="title"
          style={[
            GlobalStyles.grow,
            {
              fontSize: fontSizes.md,
              lineHeight: fontSizes.md * 1.4,
            },
            unread && {
              fontWeight: fontWeights.semibold,
            },
            titleStyle,
          ]}
          weight="medium"
          numberOfLines={
            multilineTitle
              ? undefined
              : (titleProps?.numberOfLines ?? (card ? 2 : 1))
          }
          ellipsizeMode={titleProps?.ellipsizeMode ?? 'tail'}
          {...titleProps}
        >
          {title}
        </Text>
      </Row>
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
            lineHeight: fontSizes.sm * 1.4,
          },
          subtitleStyle,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
        {...subtitleProps}
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
        <Col flex={1} style={inverted && { flexDirection: 'column-reverse' }}>
          {titleElement}
          {subtitleElement}
        </Col>
        {!card &&
          (!trailingItem && (linkTo || isAction) && IS_IOS ? (
            <DisclosureIndicator />
          ) : (
            trailingItem
          ))}
      </View>
    </TouchableHighlight>
  );
};
