import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CourseOverview as ApiCourseOverview,
  CourseDirectory,
  CourseDirectoryContentInner,
  CourseFileOverview,
  CourseOverviewPreviousEditionsInner,
  CoursePreferencesRequest,
  CourseVcOtherCoursesInner,
  CoursesApi,
  UploadCourseAssignmentRequest,
} from '@polito/api-client';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { CourseLectureSection } from '../../features/courses/types/CourseLectureSections';
import { isCourseDetailed } from '../../features/courses/utils/courses';
import { notNullish } from '../../utils/predicates';
import { pluckData } from '../../utils/queries';
import { courseColors } from '../constants';
import {
  CoursesPreferences,
  usePreferencesContext,
} from '../contexts/PreferencesContext';
import { CourseOverview } from '../types/api';
import {
  CourseDirectoryContentWithLocations,
  CourseFileOverviewWithLocation,
} from '../types/files';
import { useGetExams } from './examHooks';

export const COURSES_QUERY_KEY = ['courses'];
export const COURSE_QUERY_PREFIX = 'course';

export const useCoursesClient = (): CoursesApi => {
  return new CoursesApi();
};

const setupCourses = (
  courses: ApiCourseOverview[],
  coursePreferences: CoursesPreferences,
  updatePreference: ReturnType<
    typeof usePreferencesContext
  >['updatePreference'],
): CourseOverview[] => {
  let hasNewPreferences = false;
  // Associate each course with a set of preferences, if missing

  const updatedCourses: CourseOverview[] = [];

  courses?.forEach(c => {
    const newC = c as CourseOverview;
    const hasDetails = isCourseDetailed(newC);
    newC.uniqueShortcode = c.shortcode + c.moduleNumber;

    if (hasDetails && !(newC.uniqueShortcode in coursePreferences)) {
      const usedColors = Object.values(coursePreferences)
        .map(cp => cp.color)
        .filter(notNullish);
      let colorData: (typeof courseColors)[0] | undefined;
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
      coursePreferences[newC.uniqueShortcode] = {
        color: colorData.color,
        isHidden: false,
        isHiddenInAgenda: false,
      };
      hasNewPreferences = true;
    }

    updatedCourses.push(newC);
  });

  if (hasNewPreferences) {
    updatePreference('courses', coursePreferences);
  }

  return updatedCourses;
};

export const useGetCourses = () => {
  const coursesClient = useCoursesClient();
  const { courses: coursePreferences, updatePreference } =
    usePreferencesContext();

  return useQuery<CourseOverview[]>({
    queryKey: COURSES_QUERY_KEY,
    queryFn: () =>
      coursesClient
        .getCourses()
        .then(pluckData)
        .then(c => c.sort((a, b) => (a.name > b.name ? 1 : -1)))
        .then(c => setupCourses(c, coursePreferences, updatePreference)),
  });
};

export const CourseSectionEnum = {
  Overview: 'overview',
  Editions: 'editions',
  Guide: 'guide',
  Exams: 'exams',
  Notices: 'notices',
  Files: 'files',
  Assignments: 'assignments',
} as const;
export type CourseQueryEnum =
  (typeof CourseSectionEnum)[keyof typeof CourseSectionEnum];

export const getCourseKey = (
  courseId: number,
  section: CourseQueryEnum = CourseSectionEnum.Overview,
) => [COURSE_QUERY_PREFIX, courseId, section];

export const useGetCourse = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery({
    queryKey: getCourseKey(courseId),
    queryFn: () => {
      return coursesClient
        .getCourse({ courseId: courseId })
        .then(pluckData)
        .then(course => {
          const { teachingPeriod } = course;
          const period = teachingPeriod?.split('-');
          if (period.length > 1 && period[0] === period[1]) {
            course.teachingPeriod = period[0];
          }
          return course;
        });
    },
    staleTime: Infinity,
  });
};

export const useGetCourseEditions = (courseId: number) => {
  const coursesQuery = useGetCourses();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Editions),
    queryFn: () => {
      const course = coursesQuery.data?.find(
        c =>
          c.id === courseId || c.previousEditions.some(e => e.id === courseId),
      );
      const editions: CourseOverviewPreviousEditionsInner[] = [];
      if (!course || !course.previousEditions.length) return editions;
      if (course.id) {
        editions.push({
          id: course.id,
          year: course.year,
        });
        editions.push(...course.previousEditions);
      } else {
        const prevEditions = course.previousEditions
          .filter(e => e.id !== null)
          .sort((a, b) => +b.year - +a.year)
          .slice(1);
        editions.push(...prevEditions);
      }
      return editions;
    },
    enabled: !!coursesQuery.data,
  });
};

const courseFilesStaleTime = 60000; // 1 minute

export const useGetCourseFiles = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Files),
    queryFn: () => {
      return coursesClient
        .getCourseFiles({ courseId: courseId })
        .then(pluckData)
        .then(computeFileLocations);
    },
    staleTime: courseFilesStaleTime,
  });
};

export const useGetCourseFilesRecent = (courseId: number) => {
  const filesQuery = useGetCourseFiles(courseId);

  const recentFilesQuery = useQuery({
    queryKey: [COURSE_QUERY_PREFIX, courseId, 'recentFiles'],
    queryFn: () => sortRecentFiles(filesQuery.data!),
    enabled: !!filesQuery.data && !filesQuery.isRefetching,
    staleTime: courseFilesStaleTime,
  });

  return {
    ...recentFilesQuery,
    refetch: async () => {
      await filesQuery.refetch();
      return recentFilesQuery.refetch();
    },
  };
};

const isFile = (
  item: CourseDirectoryContentInner,
): item is { type: 'file' } & CourseFileOverview => item.type === 'file';

/**
 * Assigns a location to each file
 */
const computeFileLocations = (
  directoryContent: CourseDirectoryContentInner[],
  location: string = '/',
): CourseDirectoryContentWithLocations[] => {
  const result: CourseDirectoryContentWithLocations[] = [];
  directoryContent?.forEach(item => {
    if (isFile(item)) {
      result.push({ ...item, location });
    } else {
      result.push({
        ...item,
        files: computeFileLocations(
          item.files,
          location.length === 1
            ? location + item.name
            : location + '/' + item.name,
        ),
      });
    }
  });
  return result;
};

/**
 * Extract a flat array of files contained into the given directory tree
 */
const flattenFiles = (
  directoryContent:
    | CourseDirectoryContentWithLocations[]
    | CourseFileOverviewWithLocation[],
): CourseFileOverviewWithLocation[] => {
  const result: CourseFileOverviewWithLocation[] = [];
  directoryContent?.forEach(item => {
    if ((item as CourseDirectoryContentWithLocations).type === 'file') {
      result.push(item as CourseFileOverviewWithLocation);
    } else {
      result.push(
        ...flattenFiles(
          (
            item as Extract<
              CourseDirectoryContentWithLocations,
              { type: 'directory' }
            >
          ).files,
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
  directoryContent: CourseDirectoryContentWithLocations[],
): CourseFileOverviewWithLocation[] => {
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

  const directoryQuery = useQuery({
    queryKey: [
      COURSE_QUERY_PREFIX,
      courseId,
      'directories',
      directoryId ?? 'root',
    ],
    queryFn: () => {
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
    enabled: !!rootDirectoryContent && !filesQuery.isRefetching,
    staleTime: courseFilesStaleTime,
  });
  return {
    ...directoryQuery,
    refetch: async () => {
      await filesQuery.refetch();
      return directoryQuery.refetch();
    },
  };
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

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Assignments),
    queryFn: () =>
      coursesClient
        .getCourseAssignments({ courseId: courseId })
        .then(pluckData),
  });
};

export const useUploadAssignment = (courseId: number) => {
  const coursesClient = useCoursesClient();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (dto: UploadCourseAssignmentRequest) =>
      coursesClient.uploadCourseAssignment(dto),
    onSuccess() {
      return client.invalidateQueries({
        queryKey: getCourseKey(courseId, CourseSectionEnum.Assignments),
      });
    },
  });
};

export const useGetCourseGuide = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Guide),
    queryFn: () =>
      coursesClient.getCourseGuide({ courseId: courseId }).then(pluckData),
  });
};

export const useGetCourseNotices = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Notices),
    queryFn: () =>
      coursesClient.getCourseNotices({ courseId: courseId }).then(pluckData),
  });
};

export const useGetCourseVirtualClassrooms = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery({
    queryKey: [COURSE_QUERY_PREFIX, courseId, 'virtual-classrooms'],
    queryFn: () =>
      coursesClient
        .getCourseVirtualClassrooms({ courseId: courseId })
        .then(pluckData),
  });
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

  return useQuery({
    queryKey: [COURSE_QUERY_PREFIX, courseId, 'videolectures'],
    queryFn: () =>
      coursesClient
        .getCourseVideolectures({ courseId: courseId })
        .then(pluckData),
  });
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

  return useQuery<CourseLectureSection[]>({
    queryKey: [COURSE_QUERY_PREFIX, courseId, 'lectures'],
    queryFn: () => {
      const lectureSections: CourseLectureSection[] = [];

      virtualClassroomsQuery.data?.length &&
        lectureSections.push({
          courseId,
          title: t('common.virtualClassroom_plural'),
          type: 'VirtualClassroom',
          data: virtualClassroomsQuery.data,
        });

      videoLecturesQuery.data?.length &&
        lectureSections.push({
          courseId,
          title: t('common.videoLecture_plural'),
          type: 'VideoLecture',
          data: videoLecturesQuery.data,
        });

      relatedVCDefinitions.forEach((d, index) => {
        const relatedVCs = relatedVCQueries.queries[index].data;
        relatedVCs?.length &&
          lectureSections.push({
            courseId: d.id,
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
    enabled: !(
      courseQuery.isLoading ||
      videoLecturesQuery.isLoading ||
      virtualClassroomsQuery.isLoading ||
      relatedVCQueries.isLoading
    ),
  });
};
export const useGetCourseExams = (
  courseId: number,
  courseShortcode: string | undefined,
) => {
  const { data: exams } = useGetExams();
  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Exams),
    queryFn: () =>
      exams!.filter(exam => {
        return exam.courseShortcode === courseShortcode;
      }),
    enabled: courseShortcode !== undefined && exams !== undefined,
  });
};

export const useUpdateCoursePreferences = (courseId: number) => {
  const coursesClient = useCoursesClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: CoursePreferencesRequest) =>
      coursesClient.updateCoursePreferences({
        courseId,
        coursePreferencesRequest: preferences,
      }),
    onSuccess() {
      return queryClient.invalidateQueries({
        queryKey: getCourseKey(courseId),
      });
    },
  });
};
