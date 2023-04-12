import { useContext, useMemo } from 'react';
import { CachesDirectoryPath } from 'react-native-fs';

import { useGetStudent } from '../../../core/queries/studentHooks';
import { CourseContext } from '../contexts/CourseContext';

export const useCourseFilesCachePath = () => {
  const { data: student } = useGetStudent();
  const courseId = useContext(CourseContext);

  return useMemo(
    () =>
      [CachesDirectoryPath, student?.username, 'Courses', courseId].join('/'),
    [student, courseId],
  );
};

export const useCoursesFilesCachePath = () => {
  return CachesDirectoryPath;
};
