import {
  CourseDirectory,
  CourseDirectoryEntry,
} from '@polito/student-api-client';

export const isDirectory = (
  obj: CourseDirectoryEntry,
): obj is CourseDirectory => obj.type === 'directory';
