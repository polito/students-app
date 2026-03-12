import { Lecture as ApiLecture } from '@polito/api-client';

export interface Lecture extends ApiLecture {
  uniqueShortcode?: string;
}
