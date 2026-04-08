import { useEffect, useMemo, useState } from 'react';

import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { readDirectoryWithInfo } from '../../../core/storage/fileSystem';
import { stripIdInParentheses } from '../../../utils/files';
import { useCourseContext } from '../contexts/CourseContext';

export const useCourseFilesCachePath = () => {
  const { getCourseFolderPath, getCoursesCachePath } = useDownloadsContext();
  const courseId = useCourseContext();
  const { data: course } = useGetCourse(courseId);
  const cacheFolderName = useMemo(
    () =>
      course?.name
        ? stripIdInParentheses(`${course.name} (${courseId})`)
        : courseId.toString(),
    [course?.name, courseId],
  );
  const principalCachePath = useMemo(
    () => getCourseFolderPath(courseId, course?.name),
    [courseId, course?.name, getCourseFolderPath],
  );
  const coursesFilesCachePath = getCoursesCachePath();
  const [alternativeCachePaths, setAlternativeCachePaths] = useState<string[]>(
    [],
  );

  useEffect(() => {
    readDirectoryWithInfo(coursesFilesCachePath)
      .then(coursesCaches =>
        coursesCaches.filter(
          c =>
            c.isDirectory &&
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

/** Base path for all courses (internal or staging). Use from SettingsScreen or when you need only the root. */
export const useCoursesFilesCachePath = () => {
  const { getCoursesCachePath } = useDownloadsContext();
  return getCoursesCachePath();
};
