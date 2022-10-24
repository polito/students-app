import { DateTime } from 'luxon';

export const isToday = (date: Date): boolean => {
  const today = DateTime.now().toISODate();
  const dateISO = date.toISOString();

  return DateTime.fromISO(dateISO).toISODate() === today;
};

export const isTomorrow = (date: Date): boolean => {
  const today = DateTime.now().plus({ days: 1 }).toISODate();
  const dateISO = date.toISOString();

  return DateTime.fromISO(dateISO).toISODate() === today;
};

export const weekDay = (date: Date, t: any): string => {
  if (isToday(date)) return t('Today');
  if (isTomorrow(date)) return t('Tomorrow');
  return DateTime.fromISO(date.toISOString()).toFormat('EEEE');
};
