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
  compact?: boolean;
}

/**
 * A card used to present an agenda item
 */
export const AgendaCard = ({
  title,
  children,
  color,
  compact = false,
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
          marginVertical: spacing[2],
        },
        compact ? styles.compact : undefined,
      ]}
    >
      <TouchableHighlight
        underlayColor={colors.touchableHighlight}
        style={styles.touchable}
        onPress={onPress}
      >
        <Col gap={2}>
          <Row align="flex-end" justify="space-between">
            <Text style={styles.time}>{time && !compact && time}</Text>
            <Text uppercase variant="caption">
              {type}
            </Text>
          </Row>
          <Row>
            {iconColor && <AgendaIcon icon={icon} color={iconColor} />}
            <Text
              style={[
                styles.title,
                iconColor ? styles.titleWithIcon : undefined,
              ]}
            >
              {title}
            </Text>
          </Row>
          {live && (
            <View>
              <LiveIndicator />
            </View>
          )}
          {children}
          {location && <Text style={styles.location}>{location}</Text>}
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
    compact: {
      overflow: 'hidden',
    },
  });
