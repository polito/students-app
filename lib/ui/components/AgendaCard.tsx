import { PropsWithChildren, useMemo } from 'react';
import { StyleSheet, TouchableHighlight, ViewProps } from 'react-native';
import { isTablet as isTabletHelper } from 'react-native-device-info';

import {
  faClock,
  faLocationDot,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Stack } from '@lib/ui/components/Stack';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';
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
  color?: string;
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
  /**
   * If true, the card will be compact
   */
  isCompact?: boolean;
  /**
   * If true, the card will be a next lecture card
   */
  nextLecture?: boolean;
  /**
   * The date of the next lecture
   */
  nextDate?: string;
  style?: ViewProps['style'];
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
  style,
  nextLecture = false,
  nextDate,
}: PropsWithChildren<AgendaCardProps>) => {
  const styles = useStylesheet(createStyles);
  const { colors, dark, palettes, shapes, spacing, fontSizes } = useTheme();
  const { accessibility } = usePreferencesContext();
  const isTablet = useMemo(() => isTabletHelper(), []);
  const showsIcon = useMemo(() => iconColor && icon, [icon, iconColor]);

  const secondaryIfLecture = useMemo(
    () =>
      ['lezione', 'lecture'].includes(type.toLowerCase())
        ? { color: colors.lectureCardSecondary }
        : undefined,
    [type, colors.lectureCardSecondary],
  );

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
        style,
        isCompact &&
          !isTablet && {
            borderRadius: shapes.md,
          },
      ]}
    >
      <TouchableHighlight
        underlayColor={colors.touchableHighlight}
        style={[
          styles.touchable,
          isCompact ? styles.compactTouchable : undefined,
          isCompact &&
            !isTablet && {
              paddingHorizontal: spacing[1],
              paddingVertical: spacing[1],
            },
        ]}
        onPress={onPress}
      >
        <Col
          gap={isCompact ? 0.5 : 2}
          style={
            isCompact && { height: '100%', justifyContent: 'space-between' }
          }
        >
          {/* Time and event type are only shown if the card is not compact */}
          {!isCompact && !nextLecture && (
            <Row align="flex-end" justify="space-between" flexGrow={1}>
              <Row gap={2}>
                <Text
                  style={[
                    styles.time,
                    secondaryIfLecture,
                    accessibility?.fontSize &&
                    Number(accessibility?.fontSize) >= 150
                      ? { marginTop: 30 }
                      : undefined,
                  ]}
                >
                  {time && time}
                </Text>
                {!isCompact && live && <LiveIndicator showText />}
              </Row>
              <Text uppercase variant="caption" style={secondaryIfLecture}>
                {type}
              </Text>
            </Row>
          )}
          {nextLecture && !isCompact && (
            <Col
              align="flex-start"
              justify="space-between"
              flexGrow={1}
              gap={2}
            >
              <Row gap={1} align="center" justify="space-between">
                <Text uppercase variant="caption" style={secondaryIfLecture}>
                  {type}
                </Text>
              </Row>
              {!isCompact && live && <LiveIndicator showText />}
              <Row gap={1} mt={1.5} align="center">
                <Icon
                  icon={faClock}
                  color={palettes.gray[dark ? 300 : 600]}
                  size={isCompact && !isTablet ? fontSizes.xs : undefined}
                />
                <Text style={[styles.time, secondaryIfLecture]}>
                  {' '}
                  {time && time}
                </Text>
              </Row>
            </Col>
          )}
          {nextLecture && isCompact && (
            <Col
              align="flex-start"
              justify="space-between"
              flexGrow={1}
              gap={2}
            >
              <Row gap={1} align="center" justify="space-between">
                <Text uppercase variant="caption" style={secondaryIfLecture}>
                  {type}
                </Text>
                {!isCompact && live && <LiveIndicator showText />}
              </Row>
              <Row gap={1} mt={1.5} align="center">
                <Icon
                  icon={faVideo}
                  color={palettes.gray[dark ? 300 : 600]}
                  size={isCompact && !isTablet ? fontSizes.xs : undefined}
                />
                <Text
                  variant="secondaryText"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ color: palettes.gray[dark ? 100 : 700] }}
                >
                  {nextDate}
                </Text>
              </Row>

              <Row gap={1} mt={1.5} align="center">
                <Icon
                  icon={faClock}
                  color={palettes.gray[dark ? 300 : 600]}
                  size={isCompact && !isTablet ? fontSizes.xs : undefined}
                />
                <Text style={[styles.time, secondaryIfLecture]}>
                  {time && time}
                </Text>
              </Row>
            </Col>
          )}
          {!nextLecture && (
            <Stack
              {...(isCompact
                ? {
                    direction: !isTablet ? 'column' : 'row',
                    flexGrow: 1,
                    gap: isTablet ? 2 : undefined,
                  }
                : { align: 'center', gap: 2 })}
            >
              {showsIcon && <AgendaIcon icon={icon} color={iconColor!} />}
              <Text
                style={[
                  styles.title,
                  isCompact
                    ? isTablet
                      ? styles.titleCompactTablet
                      : styles.titleCompact
                    : undefined,
                  accessibility?.fontSize &&
                  Number(accessibility?.fontSize) >= 150
                    ? { lineHeight: 30 }
                    : undefined,
                ]}
                numberOfLines={isCompact ? (isTablet ? 2 : 3) : undefined}
              >
                {title}
              </Text>
            </Stack>
          )}

          {/* Extra children are only shown if the card is not compact */}
          {!isCompact && children}

          {!isCompact && location && (
            <Row gap={1} mt={1.5} align="center">
              <Icon
                icon={faLocationDot}
                color={palettes.gray[dark ? 300 : 600]}
                size={isCompact && !isTablet ? fontSizes.xs : undefined}
              />
              <Text
                variant="secondaryText"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: palettes.gray[dark ? 100 : 700] }}
              >
                {location}
              </Text>
            </Row>
          )}
          {isCompact && location && (
            <Row gap={1} mt={1.5} align="center">
              <Text
                variant="secondaryText"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: palettes.gray[dark ? 100 : 700] }}
              >
                {location}
              </Text>
              <Icon
                icon={faLocationDot}
                color={palettes.gray[dark ? 300 : 600]}
                size={!isTablet ? fontSizes.xs : undefined}
              />
            </Row>
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
      lineHeight: fontSizes.md * 1.3,
    },
    titleCompact: {
      fontSize: fontSizes.xs,
      lineHeight: fontSizes.xs * 1.3,
    },
    titleCompactTablet: {
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.xs * 1.3,
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
  });
