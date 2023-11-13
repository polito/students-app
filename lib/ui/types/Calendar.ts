import { ComponentType, ReactElement } from 'react';
import { RecursiveArray, TextStyle, ViewStyle } from 'react-native';

import { DateTime } from 'luxon';

import { CalendarHeaderProps } from '../components/calendar/CalendarHeader';

export interface ICalendarEventBase {
  start: DateTime;
  end: DateTime;
  title: string;
  children?: ReactElement | null;
  hideHours?: boolean;
  hours?: number[];
}

export type CalendarTouchableOpacityProps = {
  delayPressIn: number;
  key: string;
  style: RecursiveArray<ViewStyle | undefined> | ViewStyle;
  onPress: () => void;
  disabled: boolean;
};

export type Mode = '3days' | 'week' | 'day' | 'custom' | 'month';

export type EventCellStyle<T extends ICalendarEventBase> =
  | ViewStyle
  | ViewStyle[]
  | ((event: T) => ViewStyle | ViewStyle[]);

export type CalendarCellStyle =
  | ViewStyle
  | ((date?: DateTime, hourRowIndex?: number) => ViewStyle);

export type CalendarCellTextStyle =
  | TextStyle
  | ((date?: DateTime, hourRowIndex?: number) => TextStyle);

export type WeekNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HasDateRange = [DateTime, DateTime];

export type DateRangeHandler = ([start, end]: HasDateRange) => void;

export type HorizontalDirection = 'RIGHT' | 'LEFT';

export type EventRenderer<T extends ICalendarEventBase = ICalendarEventBase> = (
  event: T,
  touchableOpacityProps: CalendarTouchableOpacityProps,
) => JSX.Element;

export type HeaderRenderer = ComponentType<
  CalendarHeaderProps & { mode: Mode }
>;
