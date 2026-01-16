import {
  CourseOverview as ApiCourseOverview,
  Exam as ApiExam,
} from '@polito/api-client';

export type SuccessResponse<T> = {
  data: T;
};

export interface Exam extends ApiExam {
  isTimeToBeDefined: boolean;
  uniqueShortcode: string;
}

export interface CourseOverview extends ApiCourseOverview {
  uniqueShortcode: string;
}
