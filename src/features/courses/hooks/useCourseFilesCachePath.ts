import { useMemo } from 'react';
import { CachesDirectoryPath } from 'react-native-fs';

import { useApiContext } from '@core/contexts/ApiContext';

import { useCourseContext } from '../contexts/CourseContext';

export const useCourseFilesCachePath = () => {
  const { username } = useApiContext();
  const courseId = useCourseContext();

  return useMemo(() => {
    return [CachesDirectoryPath, username, 'Courses', courseId].join('/');
  }, [username, courseId]);
};

export const useCoursesFilesCachePath = () => {
  return CachesDirectoryPath;
};
