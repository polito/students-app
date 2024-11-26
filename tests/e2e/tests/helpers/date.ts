import { format } from 'date-fns';
import { enUS, it } from 'date-fns/locale';

import { setup } from '../../config/setup';

function convertToDateString(date: Date) {
  return format(date, 'dd/MM/yyyy');
}
function convertDateToHourMinute(date: Date) {
  return format(date, 'HH:mm');
}

function getMondayCurrentWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(now.setDate(diff));
}
function getSaturdayCurrentWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + 5; // adjust when day is saturday
  return new Date(now.setDate(diff));
}

function convertDateToStringInItalyTZ(date: Date) {
  // UTC format
  if (date.toISOString().endsWith('Z')) {
    return date.toLocaleString('it-IT', {
      timeZone: 'Europe/Rome',
    });
  }
  return date.toLocaleString();
}

function convertToDayMonth(date: Date) {
  const day = date.getDate();
  return format(date, day < 10 ? 'd MMMM' : 'dd MMMM', {
    locale: it,
  }).toLowerCase();
}

function getFullMonthString() {
  const now = new Date();
  const locale = setup.language === 'it' ? it : enUS;
  const fullMonthString = format(now, 'MMMM', { locale });

  return setup.language === 'it'
    ? fullMonthString.toLowerCase()
    : fullMonthString;
}

const timeoutTest = 1000;

export {
  timeoutTest,
  getFullMonthString,
  convertToDateString,
  convertToDayMonth,
  getMondayCurrentWeek,
  getSaturdayCurrentWeek,
  convertDateToHourMinute,
  convertDateToStringInItalyTZ,
};
