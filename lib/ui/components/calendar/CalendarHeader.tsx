import { useCallback } from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { ICalendarEventBase } from '../../types/Calendar';
import { isToday } from '../../utils/calendar';
import { objHasContent, stringHasContent } from '../../utils/object';

export interface CalendarHeaderProps<T extends ICalendarEventBase> {
  dateRange: DateTime[];
  cellHeight: number;
  style: ViewStyle;
  allDayEvents: T[];
  onPressDateHeader?: (date: DateTime) => void;
  onPressEvent?: (event: T) => void;
  activeDate?: DateTime;
  headerContentStyle?: ViewStyle;
  dayHeaderStyle?: ViewStyle;
  dayHeaderHighlightColor?: string;
  weekDayHeaderHighlightColor?: string;
  showAllDayEventCell?: boolean;
  hideHours?: boolean;
}

export const CalendarHeader = <T extends ICalendarEventBase>({
  dateRange,
  cellHeight,
  style,
  allDayEvents,
  onPressDateHeader,
  onPressEvent,
  activeDate,
  headerContentStyle = {},
  dayHeaderStyle = {},
  dayHeaderHighlightColor = '',
  weekDayHeaderHighlightColor = '',
  showAllDayEventCell = true,
  hideHours = false,
}: CalendarHeaderProps<T>) => {
  const _onPressHeader = useCallback(
    (date: DateTime) => {
      onPressDateHeader && onPressDateHeader(date);
    },
    [onPressDateHeader],
  );

  const _onPressEvent = useCallback(
    (event: T) => {
      onPressEvent && onPressEvent(event);
    },
    [onPressEvent],
  );

  const theme = useTheme();

  const borderColor = { borderColor: theme.palettes.gray['200'] };
  const primaryBg = { backgroundColor: theme.colors.heading };

  return (
    <View
      style={[
        showAllDayEventCell
          ? {
              borderBottomWidth: 1,
            }
          : {},
        showAllDayEventCell ? borderColor : {},
        { display: 'flex', flexDirection: 'row' },
        style,
      ]}
    >
      {/* TODO FIX style u['z-10'], u['w-50'] */}
      {!hideHours && <View style={borderColor} />}
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
                { height: cellHeight },
                objHasContent(headerContentStyle)
                  ? headerContentStyle
                  : {
                      justifyContent: 'space-between',
                    },
              ]}
            >
              <Text
                style={{
                  fontSize: theme.fontSizes.xs,
                  textAlign: 'center',
                  color: shouldHighlight
                    ? stringHasContent(weekDayHeaderHighlightColor)
                      ? weekDayHeaderHighlightColor
                      : theme.palettes.primary['500']
                    : theme.palettes.gray['500'],
                }}
              >
                {date.toFormat('ddd')}
              </Text>
              <View
                style={
                  objHasContent(dayHeaderStyle)
                    ? dayHeaderStyle
                    : shouldHighlight
                    ? [
                        primaryBg,
                        // TODO FIX STYLE
                        // u['h-36'],
                        // u['w-36'],
                        // u['pb-6'],
                        // u['rounded-full'],
                        // u['items-center'],
                        // u['justify-center'],
                        // u['self-center'],
                        // u['z-20'],
                      ]
                    : [
                        {
                          marginBottom: theme.spacing[6],
                        },
                      ]
                }
              >
                <Text
                  style={{
                    color: shouldHighlight
                      ? stringHasContent(dayHeaderHighlightColor)
                        ? dayHeaderHighlightColor
                        : theme.colors.heading
                      : theme.palettes.gray['800'],
                    fontSize: theme.fontSizes.xl,
                    textAlign: 'center',
                  }}
                >
                  {date.toFormat('D')}
                </Text>
              </View>
            </View>
            {showAllDayEventCell ? (
              <View
                style={[
                  // u['border-l'],
                  { borderColor: theme.palettes.gray['200'] },
                  { height: cellHeight },
                ]}
              >
                {/* TODO RESTORE ALL DAY EVENTS */}
                {/* {allDayEvents.map((event, index) => {*/}
                {/*  if (*/}
                {/*    !dayjs(date).isBetween(event.start, event.end, 'day', '[]')*/}
                {/*  ) {*/}
                {/*    return null;*/}
                {/*  }*/}
                {/*  return (*/}
                {/*    <TouchableOpacity*/}
                {/*      style={[eventCellCss.style, primaryBg, u['mt-2']]}*/}
                {/*      key={index}*/}
                {/*      onPress={() => _onPressEvent(event)}*/}
                {/*    >*/}
                {/*      <Text*/}
                {/*        style={{*/}
                {/*          fontSize: theme.typography.sm.fontSize,*/}
                {/*          color: theme.palette.primary.contrastText,*/}
                {/*        }}*/}
                {/*      >*/}
                {/*        {event.title}*/}
                {/*      </Text>*/}
                {/*    </TouchableOpacity>*/}
                {/*  );*/}
                {/* })}*/}
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
