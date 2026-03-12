import { CourseDirectory, CourseDirectoryEntry } from '@polito/api-client';

export const isDirectory = (
  obj: CourseDirectoryEntry,
): obj is CourseDirectory => obj.type === 'directory';
