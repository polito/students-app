import { useContext } from 'react';
import { CachesDirectoryPath } from 'react-native-fs';

import { useGetStudent } from '../../../core/queries/studentHooks';
import { CourseContext } from '../contexts/CourseContext';

export const useCourseFilesCachePath = () => {
  const { data: student } = useGetStudent();
  const courseId = useContext(CourseContext);

  return [
    CachesDirectoryPath,
    student?.data.username,
    'Courses',
    courseId,
  ].join('/');
};

export const useCoursesFilesCachePath = () => {
  return CachesDirectoryPath;
};
