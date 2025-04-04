import { PlaceRef } from '@polito/api-client';
import { RelatedVirtualClassroom } from '@polito/api-client/models/RelatedVirtualClassroom';

import { DateTime } from 'luxon';

export const ALL_AGENDA_TYPES = [
  'booking',
  'deadline',
  'exam',
  'lecture',
] as const;

export type AgendaItemType = (typeof ALL_AGENDA_TYPES)[number];

interface BaseAgendaItem {
  key: string;
  type: AgendaItemType;
  title: string;
  startTimestamp: number;
  date: string;
  start: DateTime;
  end: DateTime;
}

export interface BookingItem extends BaseAgendaItem {
  id: number;
  type: 'booking';
  fromTime: string;
  toTime: string;
}

export interface DeadlineItem extends BaseAgendaItem {
  id: number;
  type: 'deadline';
  url: string | null;
}

export interface ExamItem extends BaseAgendaItem {
  id: number;
  type: 'exam';
  fromTime: string;
  isTimeToBeDefined: boolean;
  teacherId: number;
  places: PlaceRef[];
  color?: string;
  icon?: string;
}

export interface LectureItem extends BaseAgendaItem {
  id: number;
  courseId: number;
  type: 'lecture';
  fromTime: string;
  toTime: string;
  teacherId: number;
  description: string | null;
  place: PlaceRef | null;
  virtualClassrooms: RelatedVirtualClassroom[];
  color?: string;
  icon?: string;
  uniqueShortcode?: string;
}

export type AgendaItem = BookingItem | DeadlineItem | ExamItem | LectureItem;
