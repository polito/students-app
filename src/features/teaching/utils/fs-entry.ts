import {
  CourseDirectory,
  CourseDirectoryContentInner,
} from '@polito/api-client';

export const isDirectory = (
  obj: CourseDirectoryContentInner,
): obj is { type: 'directory' } & CourseDirectory => obj.type === 'directory';
