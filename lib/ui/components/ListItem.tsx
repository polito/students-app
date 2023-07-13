import {
  StyleProp,
  TextProps,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';

import { Badge } from '@lib/ui/components/Badge';
import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { IS_IOS } from '../../../src/core/constants';
import { GlobalStyles } from '../../../src/core/styles/globalStyles';
import { resolveLinkTo } from '../../../src/utils/resolveLinkTo';
import { useTheme } from '../hooks/useTheme';
import { DisclosureIndicator } from './DisclosureIndicator';
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
  titleProps?: TextProps;
  unread?: boolean;
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
  titleProps,
  unread = false,
  ...rest
}: ListItemProps) => {
  const { fontSizes, fontWeights, colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

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
        <Col flex={1}>
          {typeof title === 'string' ? (
            <Row align="center" gap={2}>
              {unread && <Badge />}
              <Text
                variant="title"
                style={[
                  GlobalStyles.grow,
                  {
                    fontSize: fontSizes.md,
                  },
                  unread && {
                    fontWeight: fontWeights.semibold,
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
            </Row>
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
