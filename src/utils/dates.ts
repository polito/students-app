import { DateTime } from 'luxon';

const MACHINE_DATE_REGEX = /([0-9]{4})-0?([0-9]+)-0?([0-9]+)/;

export const formatDate = (date: Date) => {
  return DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');
};

export const formatDateFromString = (date: string | null) => {
  if (!date) return '';
  return DateTime.fromISO(date).toFormat('dd/MM/yyyy');
};

export const formatDateTime = (date: Date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatDateTimeAccessibility = (
  date: Date,
): { date: string; time: string } => {
  return {
    date: formatDate(date),
    time: formatTime(date),
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

export const formatTime = (date: Date) => {
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
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
