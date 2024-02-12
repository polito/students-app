import { useMemo } from 'react';
import { DocumentDirectoryPath } from 'react-native-fs';

import { useApiContext } from '../../../core/contexts/ApiContext';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { useCourseContext } from '../contexts/CourseContext';

export const useCourseFilesCachePath = () => {
  const { username } = useApiContext();
  const courseId = useCourseContext();
  const { data: course } = useGetCourse(courseId);

  return useMemo(() => {
    return [
      DocumentDirectoryPath,
      username,
      'Courses',
      course?.name ? `${course?.name} (${courseId})` : courseId,
    ].join('/');
  }, [course?.name, courseId, username]);
};

export const useCoursesFilesCachePath = () => {
  return DocumentDirectoryPath;
};
