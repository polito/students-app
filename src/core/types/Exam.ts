import { Exam as ApiExam } from '@polito/api-client';

export interface Exam extends ApiExam {
  isTimeToBeDefined: boolean;
}
