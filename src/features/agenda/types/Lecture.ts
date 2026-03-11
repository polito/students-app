import { Lecture as ApiLecture } from '@polito/student-api-client';

export interface Lecture extends ApiLecture {
  uniqueShortcode?: string;
}
