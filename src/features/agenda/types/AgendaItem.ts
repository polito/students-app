import { LecturePlace } from '@polito/api-client/models/LecturePlace';
import { RelatedVirtualClassroom } from '@polito/api-client/models/RelatedVirtualClassroom';

export type AgendaItemTypes = 'booking' | 'deadline' | 'exam' | 'lecture';

interface BaseAgendaItem {
  key: string;
  type: AgendaItemTypes;
  title: string;
  startTimestamp: number;
  date: string;
}

export interface BookingItem extends BaseAgendaItem {
  id: number;
  type: 'booking';
  fromTime: string;
  toTime: string;
}

export interface DeadlineItem extends BaseAgendaItem {
  type: 'deadline';
  url: string | null;
}

export interface ExamItem extends BaseAgendaItem {
  id: number;
  type: 'exam';
  fromTime: string;
  isTimeToBeDefined: boolean;
  teacherId: number;
  classroom: string;
  color: string;
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
  place: LecturePlace | null;
  virtualClassrooms: RelatedVirtualClassroom[];
  color: string;
  icon?: string;
}

export type AgendaItem = BookingItem | DeadlineItem | ExamItem | LectureItem;
