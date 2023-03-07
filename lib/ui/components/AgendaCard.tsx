import { PropsWithChildren } from 'react';
import { StyleSheet, TouchableHighlight, View } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

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
}

/**
 * A card used to present an agenda item
 */
export const AgendaCard = ({
  title,
  children,
  color,
  icon,
  iconColor,
  live = false,
  time,
  type,
  location,
  onPress,
}: PropsWithChildren<AgendaCardProps>) => {
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();
  return (
    <Card
      rounded
      spaced
      style={[
        styles.card,
        color && {
          borderWidth: 2,
          borderColor: color,
        },
      ]}
    >
      <TouchableHighlight
        underlayColor={colors.touchableHighlight}
        style={styles.touchable}
        onPress={onPress}
      >
        <View>
          <View style={styles.headingRow}>
            <Text style={styles.time}>{time && time}</Text>
            <Text uppercase style={styles.type}>
              {type}
            </Text>
          </View>
          <View style={styles.titleView}>
            {iconColor && <AgendaIcon icon={icon} color={iconColor} />}
            <Text style={[styles.title, iconColor && styles.titleWithIcon]}>
              {title}
            </Text>
          </View>
          <View>{live && <LiveIndicator />}</View>
          {children}
          {location && <Text style={styles.location}>{location}</Text>}
        </View>
      </TouchableHighlight>
    </Card>
  );
};

const createStyles = ({ colors, fontSizes, fontWeights, spacing }: Theme) =>
  StyleSheet.create({
    card: {
      width: '100%',
    },
    headingRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: spacing[2],
    },
    title: {
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    titleWithIcon: {
      marginLeft: spacing[1],
    },
    titleView: {
      display: 'flex',
      flexDirection: 'row',
    },
    touchable: {
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[3],
    },
    time: {
      fontSize: fontSizes.sm,
    },
    type: {
      color: colors.caption,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      marginTop: spacing[1.5],
    },
    location: {
      marginTop: spacing[1.5],
    },
  });
