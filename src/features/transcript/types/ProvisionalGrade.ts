import { ProvisionalGrade as ApiGrade } from '@polito/api-client/models/ProvisionalGrade';

export type ProvisionalGrade = ApiGrade & { gradeDescription: string };
