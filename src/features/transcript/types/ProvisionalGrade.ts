import { ProvisionalGrade as ApiGrade } from '@polito/api-client';

export type ProvisionalGrade = ApiGrade & { gradeDescription: string };
