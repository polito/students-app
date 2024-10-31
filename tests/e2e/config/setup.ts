import { format } from 'date-fns';

export const setup = {
  language: 'it',
  timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
};

process.env.TZ = 'Europe/Rome';
