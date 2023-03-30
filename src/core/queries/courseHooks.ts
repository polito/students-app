import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
import { CourseLectureSection } from '../../features/teaching/types/CourseLectureSections';
import { notNullish } from '../../utils/predicates';
import { prefixKey } from '../../utils/queries';
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

  return useQuery(prefixKey([COURSES_QUERY_KEY]), () =>
    coursesClient.getCourses().then(p => {
      let hasNewPreferences = false;
      // Associate each course with a set of preferences, if missing
      p.data.forEach(c => {
        // Skip courses without id (such as thesis)
        if (!c.id) return;

        if (!(c.id in courses)) {
          const usedColors = Object.values(courses)
            .map(cp => cp.color)
            .filter(notNullish);
          let colorData: typeof courseColors[0];
          for (const currentColor of courseColors) {
            if (!usedColors.includes(currentColor.color)) {
              colorData = currentColor;
              break;
            }
          }
          if (!colorData) {
            colorData =
              courseColors[
                Math.round(Math.random() * (courseColors.length - 1))
              ];
          }
          courses[c.id] = {
            color: colorData.color,
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
    prefixKey([COURSE_QUERY_KEY, courseId, 'overview']),
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
    prefixKey([COURSE_QUERY_KEY, courseId, 'files']),
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
    prefixKey([COURSE_QUERY_KEY, courseId, 'recentFiles']),
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
  directoryId?: string,
) => {
  const filesQuery = useGetCourseFiles(courseId);

  const rootDirectoryContent = filesQuery.data?.data;

  return useQuery(
    prefixKey([COURSE_QUERY_KEY, courseId, 'directories', directoryId]),
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

  return useQuery(prefixKey([COURSE_QUERY_KEY, courseId, 'assignments']), () =>
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

  return useQuery(prefixKey([COURSE_QUERY_KEY, courseId, 'guide']), () =>
    coursesClient.getCourseGuide({ courseId: courseId }),
  );
};

export const useGetCourseNotices = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery(prefixKey([COURSE_QUERY_KEY, courseId, 'notices']), () =>
    coursesClient.getCourseNotices({ courseId: courseId }),
  );
};

export const useGetCourseVirtualClassrooms = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery(
    prefixKey([COURSE_QUERY_KEY, courseId, 'virtual-classrooms']),
    () => coursesClient.getCourseVirtualClassrooms({ courseId: courseId }),
  );
};

export const useGetCourseRelatedVirtualClassrooms = (
  relatedVCs: (CourseAllOfVcPreviousYears | CourseAllOfVcOtherCourses)[],
) => {
  const coursesClient = useCoursesClient();

  const queries = useQueries({
    queries: (relatedVCs ?? []).map(relatedVC => {
      return {
        queryKey: prefixKey([
          COURSE_QUERY_KEY,
          relatedVC.id,
          'virtual-classrooms',
        ]),
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

  return useQuery(
    prefixKey([COURSE_QUERY_KEY, courseId, 'videolectures']),
    () => coursesClient.getCourseVideolectures({ courseId: courseId }),
  );
};

export const useGetCourseLectures = (courseId: number) => {
  const courseQuery = useGetCourse(courseId);

  const videoLecturesQuery = useGetCourseVideolectures(courseId);
  const virtualClassroomsQuery = useGetCourseVirtualClassrooms(courseId);

  const relatedVCDefinitions: (
    | CourseAllOfVcPreviousYears
    | CourseAllOfVcOtherCourses
  )[] = (courseQuery.data?.data.vcPreviousYears ?? []).concat(
    courseQuery.data?.data.vcOtherCourses,
  );

  const relatedVCQueries =
    useGetCourseRelatedVirtualClassrooms(relatedVCDefinitions);

  const { t } = useTranslation();

  return useQuery<CourseLectureSection[]>(
    prefixKey([COURSE_QUERY_KEY, courseId, 'lectures']),
    () => {
      const lectureSections: CourseLectureSection[] = [];

      virtualClassroomsQuery.data.data.length &&
        lectureSections.push({
          title: t('common.virtualClassroom_plural'),
          type: 'VirtualClassroom',
          data: virtualClassroomsQuery.data.data,
        });

      videoLecturesQuery.data.data.length &&
        lectureSections.push({
          title: t('common.videoLecture_plural'),
          type: 'VideoLecture',
          data: videoLecturesQuery.data.data,
        });

      relatedVCDefinitions.forEach((d, index) => {
        const relatedVCs = relatedVCQueries.queries[index].data?.data;
        if (!relatedVCs.length) return;
        lectureSections.push({
          title:
            'name' in d
              ? `${d.name} ${d.year}`
              : `${t('common.virtualClassroom_plural')} - ${d.year}`,
          type: 'VirtualClassroom',
          data: relatedVCs,
        });
      });

      return lectureSections;
    },
    {
      enabled: !(
        courseQuery.isLoading ||
        videoLecturesQuery.isLoading ||
        virtualClassroomsQuery.isLoading ||
        relatedVCQueries.isLoading
      ),
    },
  );
};
export const useGetCourseExams = (
  courseId: number,
  courseShortcode: string,
) => {
  const { data: exams } = useGetExams();
  return useQuery(
    prefixKey([COURSE_QUERY_KEY, courseId, 'exams']),
    () =>
      exams.filter(exam => {
        return exam.courseShortcode === courseShortcode;
      }),
    {
      enabled: courseShortcode != null && exams !== undefined,
      initialData: [],
    },
  );
};
