import { Booking, Exam } from '@polito-it/api-client';

export interface Object {
  [key: string]: any;
}

export interface AgendaItem {
  fromDate: string;
  toDate: string;
  title: string;
  type: 'Exam' | 'Booking';
  content: Exam | Booking;
}
