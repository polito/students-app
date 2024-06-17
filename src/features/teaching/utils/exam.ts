import { DateTime } from 'luxon';

export const isExamPassed = (bookingEndsAt: Date) => {
  return DateTime.now().setZone('Europe/Rome').toJSDate() > bookingEndsAt;
};

export const getExam = (bookedCount: number, availableCount: number) => {
  if (availableCount === 999) {
    return `${bookedCount}`;
  }
  return `${bookedCount}/${availableCount + bookedCount}`;
};
