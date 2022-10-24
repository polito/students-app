import { Booking, Exam } from '@polito-it/api-client';

export interface Object {
  [key: string]: any;
}

export interface AgendaDayInterface {
  id: string;
  items: AgendaItemInterface[];
}

export interface AgendaItemInterface {
  fromDate: string;
  toDate: string;
  title: string;
  classroom?: string;
  type: 'Exam' | 'Booking' | 'Lecture' | 'Deadline';
  content: Exam | Booking;
}
