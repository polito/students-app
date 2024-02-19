import { useEffect, useMemo, useState } from 'react';
import { readDir } from 'react-native-fs';

import { PUBLIC_APP_DIRECTORY_PATH } from '../../../core/constants';
import { useApiContext } from '../../../core/contexts/ApiContext';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { useCourseContext } from '../contexts/CourseContext';

export const useCourseFilesCachePath = () => {
  const coursesFilesCachePath = useCoursesFilesCachePath();
  const courseId = useCourseContext();
  const { data: course } = useGetCourse(courseId);
  const cacheFolderName = useMemo(
    () =>
      course?.name ? `${course?.name} (${courseId})` : courseId.toString(),
    [course?.name, courseId],
  );
  const principalCachePath = useMemo(() => {
    return [coursesFilesCachePath, cacheFolderName].join('/');
  }, [cacheFolderName, coursesFilesCachePath]);
  const [alternativeCachePaths, setAlternativeCachePaths] = useState<string[]>(
    [],
  );

  useEffect(() => {
    readDir(coursesFilesCachePath)
      .then(coursesCaches =>
        coursesCaches.filter(
          c =>
            c.isDirectory() &&
            c.name !== cacheFolderName &&
            c.name.includes(courseId.toString()),
        ),
      )
      .then(alternativeCaches => {
        setAlternativeCachePaths(alternativeCaches.map(i => i.path) ?? []);
      })
      .catch(() => {
        // noop
      });
  }, [cacheFolderName, courseId, coursesFilesCachePath]);

  return [principalCachePath, alternativeCachePaths] as const;
};

export const useCoursesFilesCachePath = () => {
  const { username } = useApiContext();
  return [PUBLIC_APP_DIRECTORY_PATH, username, 'Courses'].join('/');
};
