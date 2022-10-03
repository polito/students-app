import {
  CoursesApi,
  UploadCourseAssignmentRequest,
} from '@polito-it/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
          const randomColor = Math.floor(Math.random() * 16777215).toString(16);
          courses[c.id] = {
            color: `#${randomColor}`,
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

  return useQuery([COURSE_QUERY_KEY, courseId, 'overview'], () => {
    return coursesClient.getCourse({ courseId: courseId });
  });
};

export const useGetCourseFiles = (courseId: number) => {
  const coursesClient = useCoursesClient();

  return useQuery([COURSE_QUERY_KEY, courseId, 'files'], () =>
    coursesClient.getCourseFiles({ courseId: courseId }).then(files => ({
      data: files.data,
    })),
  );
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
