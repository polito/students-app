import { DateTime, IANAZone } from 'luxon';

const MACHINE_DATE_REGEX = /([0-9]{4})-0?([0-9]+)-0?([0-9]+)/;

export const formatDate = (date: Date) => {
  return DateTime.fromJSDate(date, {
    zone: IANAZone.create('Europe/Rome'),
  }).toFormat('dd/MM/yyyy');
};

export const formatReadableDate = (date: Date, short = false) => {
  return DateTime.fromJSDate(date, {
    zone: IANAZone.create('Europe/Rome'),
  }).toLocaleString({
    month: short ? 'short' : 'long',
    day: 'numeric',
  });
};

export const formatDateFromString = (date: string | null) => {
  if (!date) return '';
  return DateTime.fromISO(date, {
    zone: IANAZone.create('Europe/Rome'),
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
    zone: IANAZone.create('Europe/Rome'),
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
