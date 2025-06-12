import { useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { isToday } from '../../utils/calendar';

export interface CalendarHeaderProps {
  dateRange: DateTime[];
  cellHeight: number;
  style: ViewStyle;
  onPressDateHeader?: (date: DateTime) => void;
  activeDate?: DateTime;
  hideHours?: boolean;
}

export const CalendarHeader = ({
  dateRange,
  cellHeight,
  style,
  onPressDateHeader,
  activeDate,
  hideHours = false,
}: CalendarHeaderProps) => {
  const _onPressHeader = useCallback(
    (date: DateTime) => {
      onPressDateHeader && onPressDateHeader(date);
    },
    [onPressDateHeader],
  );

  const theme = useTheme();

  const borderColor = { borderColor: theme.palettes.gray['200'] };

  return (
    <SafeAreaView
      style={[
        {
          display: 'flex',
          flexDirection: 'row',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.divider,
        },
        style,
      ]}
    >
      {!hideHours && (
        <View
          style={[
            {
              width: 35,
            },
            borderColor,
          ]}
        />
      )}
      {dateRange.map((date, i) => {
        const shouldHighlight = activeDate
          ? date.hasSame(activeDate, 'day')
          : isToday(date);

        return (
          <TouchableOpacity
            // Theme-independent hardcoded color
            // eslint-disable-next-line react-native/no-color-literals
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              paddingVertical: theme.spacing[1],
              borderRightWidth: StyleSheet.hairlineWidth,
              borderColor:
                i < dateRange.length - 1 ? theme.colors.divider : 'transparent',
            }}
            onPress={() => _onPressHeader(date)}
            disabled={onPressDateHeader === undefined}
            key={date.toString()}
          >
            <View
              style={[
                {
                  height: cellHeight,
                  borderRadius: theme.shapes.md,
                  paddingHorizontal: theme.spacing[1],
                  paddingVertical: theme.spacing[1],
                },
                shouldHighlight && {
                  backgroundColor: theme.colors.heading,
                },
              ]}
            >
              <Text
                weight="semibold"
                style={[
                  {
                    fontSize: theme.fontSizes.sm,
                    textAlign: 'center',
                  },
                  shouldHighlight && {
                    color: theme.colors.surface,
                  },
                ]}
              >
                {date.toLocaleString({ weekday: 'short', day: 'numeric' })}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
};
