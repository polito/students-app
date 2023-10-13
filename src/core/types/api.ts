import { CourseOverview as ApiCourseOverview } from '@polito/api-client/models/CourseOverview';
import { Exam as ApiExam } from '@polito/api-client/models/Exam';

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
