import { Booking, Exam, Lecture } from '@polito-it/api-client';

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
  content: Exam | Booking | Lecture;
}
