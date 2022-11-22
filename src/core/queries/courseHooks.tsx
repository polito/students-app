import { useMemo } from 'react';

import {
  CourseAllOfVcOtherCourses,
  CourseAllOfVcPreviousYears,
  CourseDirectory,
  CourseDirectoryContentInner,
  CourseFileOverview,
  CoursesApi,
  UploadCourseAssignmentRequest,
} from '@polito/api-client';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { CourseRecentFile } from '../../features/teaching/components/CourseRecentFileListItem';
import { courseColors } from '../constants';
import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useGetExams } from './examHooks';

export const COURSES_QUERY_KEY = 'courses';
export const COURSE_QUERY_KEY = 'course';

const useCoursesClient = (): CoursesApi => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return coursesClient;
};

export const useGetCourses = () => {
  const coursesClient = useCoursesClient();
  const { courses, updatePreference } = usePreferencesContext();

  return useQuery([COURSES_QUERY_KEY], () =>
    coursesClient.getCourses().then(p => {
      let hasNewPreferences = false;
      // Associate each course with a set of preferences, if missing
      p.data.forEach(c => {
        // Skip courses without id (such as thesis)
        if (!c.id) return;

        // eslint-disable-next-line no-prototype-builtins
        if (!courses.hasOwnProperty(c.id)) {
          const randomColor = courseColors[Math.round(Math.random() * 6)];
          courses[c.id] = {
            color: randomColor.color,
            icon: null,
            isHidden: false,
          };
          hasNewPreferences = true;
        }
      });

      if (hasNewPreferences) {
        updatePreference('courses', courses);
      }

      return p;
    }),
  );
};

export const useGetCourse = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery(
    [COURSE_QUERY_KEY, courseId, 'overview'],
    () => {
      return coursesClient.getCourse({ courseId: courseId }).then(course => {
        const { teachingPeriod } = course.data;
        const period = teachingPeriod.split('-');
        if (period.length > 1 && period[0] === period[1]) {
          course.data.teachingPeriod = period[0];
        }
        return course;
      });
    },
    {
      staleTime: Infinity,
    },
  );
};

const courseFilesStaleTime = 60000; // 1 minute

export const useGetCourseFiles = (courseId: number) => {
  const coursesClient = useCoursesClient();
  const client = useQueryClient();

  return useQuery(
    [COURSE_QUERY_KEY, courseId, 'files'],
    () => {
      return coursesClient.getCourseFiles({ courseId: courseId });
    },
    {
      staleTime: courseFilesStaleTime,
      onSuccess: () => {
        return Promise.all([
          client.invalidateQueries([COURSE_QUERY_KEY, courseId, 'recentFiles']),
          client.invalidateQueries([COURSE_QUERY_KEY, courseId, 'directories']),
        ]);
      },
    },
  );
};

export const useGetCourseFilesRecent = (courseId: number) => {
  const filesQuery = useGetCourseFiles(courseId);

  const recentFilesQuery = useQuery(
    [COURSE_QUERY_KEY, courseId, 'recentFiles'],
    () => sortRecentFiles(filesQuery.data.data),
    {
      enabled: !!filesQuery.data && !filesQuery.isRefetching,
      staleTime: courseFilesStaleTime,
    },
  );

  return {
    ...recentFilesQuery,
    refetch: () => filesQuery.refetch().then(recentFilesQuery.refetch),
  };
};

/**
 * Extract a flat array of files contained into the given directory tree
 */
const flattenFiles = (
  directoryContent: CourseDirectoryContentInner[] | CourseFileOverview[],
  location: string = '/',
): CourseRecentFile[] => {
  const result: CourseRecentFile[] = [];
  directoryContent?.forEach(item => {
    if (item.type === 'file') {
      result.push({ ...item, location });
    } else {
      result.push(
        ...flattenFiles(
          (item as CourseDirectory).files,
          location.length === 1
            ? location + item.name
            : location + '/' + item.name,
        ),
      );
    }
  });
  return result;
};

/**
 * Extract files from folders and sort them by decreasing createdAt
 */
const sortRecentFiles = (
  directoryContent: CourseDirectoryContentInner[],
): CourseRecentFile[] => {
  const flatFiles = flattenFiles(directoryContent);
  return flatFiles.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
};

export const useGetCourseDirectory = (
  courseId: number,
  directoryId: string,
) => {
  const filesQuery = useGetCourseFiles(courseId);

  const rootDirectoryContent = filesQuery.data?.data;

  return useQuery(
    [COURSE_QUERY_KEY, courseId, 'directories', directoryId],
    () => {
      if (!directoryId) {
        // Root directory
        return new Promise<CourseDirectoryContentInner[]>(resolve => {
          resolve(rootDirectoryContent);
        });
      }
      const directory = findDirectory(directoryId, rootDirectoryContent);

      return new Promise<CourseDirectoryContentInner[]>(resolve => {
        resolve(directory);
      });
    },
    {
      enabled: !!rootDirectoryContent && !filesQuery.isRefetching,
      staleTime: courseFilesStaleTime,
    },
  );
};

/**
 * Recursively look for a given directory with a depth-by-depth approach
 *
 * @param searchDirectoryId The id of the directory we are looking for
 * @param directoryContent
 */
const findDirectory = (
  searchDirectoryId: string,
  directoryContent: CourseDirectoryContentInner[],
): CourseDirectoryContentInner[] => {
  let result = null;
  const childDirectories = directoryContent.filter(
    f => f.type === 'directory',
  ) as CourseDirectory[];

  let nextDepthFiles: CourseDirectoryContentInner[] = [];
  for (let i = 0; i < childDirectories.length; i++) {
    const currentDir = childDirectories[i];
    if (currentDir.id === searchDirectoryId) {
      result = currentDir.files;
      break;
    }

    nextDepthFiles = [...nextDepthFiles, ...currentDir.files];
  }

  if (!result && nextDepthFiles.length) {
    result = findDirectory(searchDirectoryId, nextDepthFiles);
  }

  return result;
};

export const useGetCourseAssignments = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery([COURSE_QUERY_KEY, courseId, 'assignments'], () =>
    coursesClient.getCourseAssignments({ courseId: courseId }),
  );
};

export const useUploadAssignment = (courseId: number) => {
  const coursesClient = useCoursesClient();
  const client = useQueryClient();

  return useMutation(
    (dto: UploadCourseAssignmentRequest) =>
      coursesClient.uploadCourseAssignment(dto),
    {
      onSuccess() {
        return client.invalidateQueries([
          COURSE_QUERY_KEY,
          courseId,
          'assignments',
        ]);
      },
    },
  );
};

export const useGetCourseGuide = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery([COURSE_QUERY_KEY, courseId, 'guide'], () =>
    coursesClient.getCourseGuide({ courseId: courseId }),
  );
};

export const useGetCourseNotices = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery([COURSE_QUERY_KEY, courseId, 'notices'], () =>
    coursesClient.getCourseNotices({ courseId: courseId }),
  );
};

export const useGetCourseVirtualClassrooms = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery([COURSE_QUERY_KEY, courseId, 'virtual-classrooms'], () =>
    coursesClient.getCourseVirtualClassrooms({ courseId: courseId }),
  );
};

export const useGetCourseRelatedVirtualClassrooms = (
  vcPreviousYears: CourseAllOfVcPreviousYears[],
  vcOtherCourses: CourseAllOfVcOtherCourses[],
) => {
  const coursesClient = useCoursesClient();

  const queries = useQueries({
    queries: (vcPreviousYears ?? [])
      .concat(vcOtherCourses ?? [])
      .map(relatedVC => {
        return {
          queryKey: [COURSE_QUERY_KEY, relatedVC.id, 'virtual-classrooms'],
          queryFn: () =>
            coursesClient.getCourseVirtualClassrooms({
              courseId: relatedVC.id,
            }),
        };
      }),
  });

  const isLoading = useMemo(() => {
    return queries.some(q => q.isLoading);
  }, [queries]);

  return { queries, isLoading };
};

export const useGetCourseVideolectures = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery([COURSE_QUERY_KEY, courseId, 'videolectures'], () =>
    coursesClient.getCourseVideolectures({ courseId: courseId }),
  );
};

export const useGetCourseExams = (
  courseId: number,
  courseShortcode: string,
) => {
  const { data: exams } = useGetExams();
  return useQuery(
    [COURSE_QUERY_KEY, courseId, 'exams'],
    () => ({
      data: exams.data.filter(exam => {
        return exam.courseShortcode === courseShortcode;
      }),
    }),
    {
      enabled: courseShortcode != null && exams != null,
      initialData: { data: [] },
    },
  );
};
