import { DateTime, IANAZone } from 'luxon';

const MACHINE_DATE_REGEX = /([0-9]{4})-0?([0-9]+)-0?([0-9]+)/;

export const APP_TIMEZONE = IANAZone.create('Europe/Rome');

export const formatDate = (date: Date) => {
  return DateTime.fromJSDate(date, {
    zone: APP_TIMEZONE,
  }).toFormat('dd/MM/yyyy');
};

export const formatReadableDate = (date: Date, short = false) => {
  return DateTime.fromJSDate(date, {
    zone: APP_TIMEZONE,
  }).toLocaleString({
    month: short ? 'short' : 'long',
    day: 'numeric',
  });
};

export const formatDateFromString = (date: string | null) => {
  if (!date) return '';
  return DateTime.fromISO(date, {
    zone: APP_TIMEZONE,
  }).toFormat('dd/MM/yyyy');
};

export const formatDateTime = (date: Date) => {
  return `${formatDate(date)} ${formatTime(date, 'HH:mm')}`;
};

export const formatDateTimeAccessibility = (
  date: Date,
): { date: string; time: string } => {
  return {
    date: formatDate(date),
    time: formatTime(date, 'HH:mm'),
  };
};

export const formatDateWithTimeIfNotNull = (date: Date) => {
  if (!date.getHours()) {
    return formatDate(date);
  }
  return formatDateTime(date);
};

export const formatMachineDate = (date: Date) => {
  return (
    `${date.getFullYear()}-` +
    `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
    `${date.getDate().toString().padStart(2, '0')}`
  );
};

const formatTime = (date: Date, format: string) => {
  return DateTime.fromJSDate(date, {
    zone: APP_TIMEZONE,
  }).toFormat(format);
};

export const dateFormatter = (format: string) => {
  return (date: Date) => {
    return formatTime(date, format);
  };
};

const today = DateTime.now();

export const isCurrentMonth = (date: DateTime): boolean => {
  return today.year === date.year && today.month === date.month;
};

export const isCurrentYear = (date: DateTime): boolean => {
  return today.year === date.year;
};

export const convertMachineDateToFormatDate = (date: string) => {
  return date.replace(MACHINE_DATE_REGEX, '$3/$2/$1');
};

export const isValidDate = (date: Date) => {
  return date.toISOString() !== new Date(0).toISOString();
};

export const toOASTruncable = (date: DateTime) => {
  // This fix is needed to correct the truncation made by OpenAPI Generator,
  // which cuts off the first characters of the date. This causes issues because
  // OpenAPI returns the date in UTC format, and in particular, when it comes to midnight (00:00),
  // the conversion can result in an hour of 23:00 on the previous day.
  return date.plus({ minute: date.offset }).toJSDate();
};
