import { ProvisionalGrade as ApiGrade } from '@polito/student-api-client';

export type ProvisionalGrade = ApiGrade & { gradeDescription: string };
