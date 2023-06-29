import { PropsWithChildren } from 'react';
import { StyleSheet, TouchableHighlight, View } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { AgendaIcon } from '../../../src/features/agenda/components/AgendaIcon';
import { Card } from './Card';
import { LiveIndicator } from './LiveIndicator';
import { Text } from './Text';

export interface AgendaCardProps {
  /**
   * The event title
   */
  title: string;
  /**
   * The color of the event type
   */
  color: string;
  /**
   * Extra information on this event
   */
  description?: string;
  /**
   * The icon of the event
   */
  icon?: string;
  /**
   * The color of the event icon
   */
  iconColor?: string;
  /**
   * Shows a live indicator
   */
  live?: boolean;
  /**
   * The room in which this event takes place
   */
  location?: string;
  /**
   * Event time information
   */
  time?: string;
  /**
   * A subtitle (ie event type)
   */
  type: string;
  /**
   * On card pressed handler
   */
  onPress?: () => void;

  /**
   * If true, the card will be compact
   */
  isCompact?: boolean;
}

/**
 * A card used to present an agenda item
 */
export const AgendaCard = ({
  title,
  children,
  color,
  isCompact = false,
  icon,
  iconColor,
  live = false,
  time,
  type,
  location,
  onPress,
}: PropsWithChildren<AgendaCardProps>) => {
  const styles = useStylesheet(createStyles);
  const { colors, spacing } = useTheme();
  return (
    <Card
      rounded
      spaced={false}
      style={[
        color
          ? {
              borderWidth: 2,
              borderColor: color,
            }
          : undefined,
        {
          marginVertical: isCompact ? undefined : spacing[2],
        },
      ]}
    >
      <TouchableHighlight
        underlayColor={colors.touchableHighlight}
        style={[
          styles.touchable,
          isCompact ? styles.compactTouchable : undefined,
        ]}
        onPress={onPress}
      >
        <Col gap={isCompact ? 0.5 : 2}>
          {!isCompact && (
            <Row align="flex-end" justify="space-between">
              <Text style={styles.time}>{time && time}</Text>
              <Text uppercase variant="caption">
                {type}
              </Text>
            </Row>
          )}
          <Row>
            {iconColor && <AgendaIcon icon={icon} color={iconColor} />}
            <Text
              style={[
                styles.title,
                iconColor ? styles.titleWithIcon : undefined,
              ]}
              numberOfLines={isCompact ? 1 : undefined}
            >
              {title}
            </Text>
          </Row>
          {live && (
            <View>
              <LiveIndicator />
            </View>
          )}
          {!isCompact && children}
          {location && (
            <Text style={!isCompact ? styles.location : undefined}>
              {location}
            </Text>
          )}
        </Col>
      </TouchableHighlight>
    </Card>
  );
};

const createStyles = ({
  colors,
  palettes,
  fontSizes,
  fontWeights,
  spacing,
  dark,
}: Theme) =>
  StyleSheet.create({
    title: {
      flex: 1,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    titleWithIcon: {
      marginLeft: spacing[1.5],
    },
    touchable: {
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[3],
    },
    compactTouchable: {
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[2],
      height: '100%',
    },
    time: {
      color: colors.secondaryText,
      fontSize: fontSizes.sm,
    },
    type: {
      color: dark ? palettes.text[300] : palettes.text[400],
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      marginTop: spacing[1.5],
    },
    location: {
      marginTop: spacing[1.5],
    },
  });
