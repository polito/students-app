import { useCallback } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';

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
  const primaryBg = { backgroundColor: theme.colors.heading };

  return (
    <View style={[{ display: 'flex', flexDirection: 'row' }, style]}>
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
      {dateRange.map(date => {
        const shouldHighlight = activeDate
          ? date.hasSame(activeDate, 'day')
          : isToday(date);

        return (
          <TouchableOpacity
            style={{
              flex: 1,
              paddingTop: theme.spacing[2],
            }}
            onPress={() => _onPressHeader(date)}
            disabled={onPressDateHeader === undefined}
            key={date.toString()}
          >
            <View
              style={[
                {
                  height: cellHeight,
                  borderRadius: theme.shapes.lg,
                  display: 'flex',
                  justifyContent: 'center',
                },
                shouldHighlight ? primaryBg : {},
              ]}
            >
              <Text
                weight="semibold"
                style={[
                  {
                    textAlign: 'center',
                  },
                  shouldHighlight
                    ? {
                        color: theme.colors.surface,
                      }
                    : {},
                ]}
              >
                {date.toLocaleString({ weekday: 'short', day: 'numeric' })}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
