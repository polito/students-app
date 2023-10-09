import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CourseDirectory,
  CourseDirectoryContentInner,
  CourseFileOverview,
  CourseOverview,
  CourseOverviewPreviousEditionsInner,
  CourseVcOtherCoursesInner,
  CoursesApi,
  UploadCourseAssignmentRequest,
} from '@polito/api-client';
import { CourseOverviewPreviousEditionsInner } from '@polito/api-client/models/CourseOverviewPreviousEditionsInner';
import { CourseVcOtherCoursesInner } from '@polito/api-client/models/CourseVcOtherCoursesInner';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { CourseRecentFile } from '../../features/teaching/components/CourseRecentFileListItem';
import { CourseLectureSection } from '../../features/teaching/types/CourseLectureSections';
import { notNullish } from '../../utils/predicates';
import { pluckData } from '../../utils/queries';
import { courseColors } from '../constants';
import {
  CoursesPreferences,
  PreferenceKey,
  usePreferencesContext,
} from '../contexts/PreferencesContext';
import { useGetExams } from './examHooks';

export const COURSES_QUERY_KEY = ['courses'];
export const COURSE_QUERY_PREFIX = 'course';

const useCoursesClient = (): CoursesApi => {
  return new CoursesApi();
};

const setupCourses = (
  courses: CourseOverview[],
  coursePreferences: CoursesPreferences,
  updatePreference: (key: PreferenceKey, value: unknown) => void,
) => {
  let hasNewPreferences = false;
  // Associate each course with a set of preferences, if missing
  courses?.forEach(c => {
    // Skip courses without id (such as thesis)
    if (!c.id) return;

    if (!(c.id in coursePreferences)) {
      const usedColors = Object.values(coursePreferences)
        .map(cp => cp.color)
        .filter(notNullish);
      let colorData: typeof courseColors[0] | undefined;
      for (const currentColor of courseColors) {
        if (!usedColors.includes(currentColor.color)) {
          colorData = currentColor;
          break;
        }
      }
      if (!colorData) {
        colorData =
          courseColors[Math.round(Math.random() * (courseColors.length - 1))];
      }
      coursePreferences[c.id] = {
        color: colorData.color,
        isHidden: false,
      };
      hasNewPreferences = true;
    }
  });

  if (hasNewPreferences) {
    updatePreference('courses', coursePreferences);
  }

  return courses;
};

export const useGetCourses = () => {
  const coursesClient = useCoursesClient();
  const { courses: coursePreferences, updatePreference } =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePreferencesContext();

  return useQuery(COURSES_QUERY_KEY, () =>
    coursesClient
      .getCourses()
      .then(pluckData)
      .then(c => setupCourses(c, coursePreferences, updatePreference)),
  );
};

export const CourseSectionEnum = {
  Overview: 'overview',
  Guide: 'guide',
  Exams: 'exams',
  Notices: 'notices',
  Files: 'files',
  Assignments: 'assignments',
} as const;
export type CourseSectionEnum =
  typeof CourseSectionEnum[keyof typeof CourseSectionEnum];

export const getCourseKey = (
  courseId: number,
  section: CourseSectionEnum = CourseSectionEnum.Overview,
) => [COURSE_QUERY_PREFIX, courseId, section];

export const useGetCourse = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery(
    getCourseKey(courseId),
    () => {
      return coursesClient
        .getCourse({ courseId: courseId })
        .then(pluckData)
        .then(course => {
          const { teachingPeriod } = course;
          const period = teachingPeriod.split('-');
          if (period.length > 1 && period[0] === period[1]) {
            course.teachingPeriod = period[0];
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
    getCourseKey(courseId, CourseSectionEnum.Files),
    () => {
      return coursesClient
        .getCourseFiles({ courseId: courseId })
        .then(pluckData);
    },
    {
      staleTime: courseFilesStaleTime,
      onSuccess: () => {
        return Promise.all([
          client.invalidateQueries([
            COURSE_QUERY_PREFIX,
            courseId,
            'recentFiles',
          ]),
          client.invalidateQueries([
            COURSE_QUERY_PREFIX,
            courseId,
            'directories',
          ]),
        ]);
      },
    },
  );
};

export const useGetCourseFilesRecent = (courseId: number) => {
  const filesQuery = useGetCourseFiles(courseId);

  const recentFilesQuery = useQuery(
    [COURSE_QUERY_PREFIX, courseId, 'recentFiles'],
    () => sortRecentFiles(filesQuery.data!),
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

  const rootDirectoryContent = filesQuery.data;

  return useQuery(
    [COURSE_QUERY_PREFIX, courseId, 'directories', directoryId ?? 'root'],
    () => {
      if (!directoryId) {
        // Root directory
        return new Promise<CourseDirectoryContentInner[]>(resolve => {
          resolve(rootDirectoryContent!);
        });
      }
      const directory = findDirectory(directoryId, rootDirectoryContent!);

      return new Promise<CourseDirectoryContentInner[] | null>(resolve => {
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
): CourseDirectoryContentInner[] | null => {
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

  return useQuery(getCourseKey(courseId, CourseSectionEnum.Assignments), () =>
    coursesClient.getCourseAssignments({ courseId: courseId }).then(pluckData),
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
        return client.invalidateQueries(
          getCourseKey(courseId, CourseSectionEnum.Assignments),
        );
      },
    },
  );
};

export const useGetCourseGuide = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery(getCourseKey(courseId, CourseSectionEnum.Guide), () =>
    coursesClient.getCourseGuide({ courseId: courseId }).then(pluckData),
  );
};

export const useGetCourseNotices = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery(getCourseKey(courseId, CourseSectionEnum.Notices), () =>
    coursesClient.getCourseNotices({ courseId: courseId }).then(pluckData),
  );
};

export const useGetCourseVirtualClassrooms = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery([COURSE_QUERY_PREFIX, courseId, 'virtual-classrooms'], () =>
    coursesClient
      .getCourseVirtualClassrooms({ courseId: courseId })
      .then(pluckData),
  );
};

export const useGetCourseRelatedVirtualClassrooms = (
  relatedVCs: (
    | CourseOverviewPreviousEditionsInner
    | CourseVcOtherCoursesInner
  )[],
) => {
  const coursesClient = useCoursesClient();

  const queries = useQueries({
    queries: (relatedVCs ?? []).map(relatedVC => {
      return {
        queryKey: [COURSE_QUERY_PREFIX, relatedVC.id, 'virtual-classrooms'],
        queryFn: () =>
          coursesClient
            .getCourseVirtualClassrooms({
              courseId: relatedVC.id,
            })
            .then(pluckData),
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

  return useQuery([COURSE_QUERY_PREFIX, courseId, 'videolectures'], () =>
    coursesClient
      .getCourseVideolectures({ courseId: courseId })
      .then(pluckData),
  );
};

export const useGetCourseLectures = (courseId: number) => {
  const courseQuery = useGetCourse(courseId);

  const videoLecturesQuery = useGetCourseVideolectures(courseId);
  const virtualClassroomsQuery = useGetCourseVirtualClassrooms(courseId);

  const relatedVCDefinitions: (
    | CourseOverviewPreviousEditionsInner
    | CourseVcOtherCoursesInner
  )[] = (courseQuery.data?.vcPreviousYears ?? []).concat(
    courseQuery.data?.vcOtherCourses ?? [],
  );

  const relatedVCQueries =
    useGetCourseRelatedVirtualClassrooms(relatedVCDefinitions);

  const { t } = useTranslation();

  return useQuery<CourseLectureSection[]>(
    [COURSE_QUERY_PREFIX, courseId, 'lectures'],
    () => {
      const lectureSections: CourseLectureSection[] = [];

      virtualClassroomsQuery.data?.length &&
        lectureSections.push({
          title: t('common.virtualClassroom_plural'),
          type: 'VirtualClassroom',
          data: virtualClassroomsQuery.data,
        });

      videoLecturesQuery.data?.length &&
        lectureSections.push({
          title: t('common.videoLecture_plural'),
          type: 'VideoLecture',
          data: videoLecturesQuery.data,
        });

      relatedVCDefinitions.forEach((d, index) => {
        const relatedVCs = relatedVCQueries.queries[index].data;
        relatedVCs?.length &&
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
  courseShortcode: string | undefined,
) => {
  const { data: exams } = useGetExams();
  return useQuery(
    getCourseKey(courseId, CourseSectionEnum.Exams),
    () =>
      (exams ?? []).filter(exam => {
        return exam.courseShortcode === courseShortcode;
      }),
    {
      enabled: courseShortcode !== undefined && exams !== undefined,
      initialData: [],
    },
  );
};
