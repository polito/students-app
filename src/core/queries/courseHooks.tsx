import { UploadCourseAssignmentRequest } from '@polito-it/api-client/apis/CoursesApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';
import { useGetExams } from './examHooks';

export const COURSES_QUERY_KEY = 'courses';
export const COURSE_QUERY_KEY = 'course';

export const useGetCourses = () => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return useQuery([COURSES_QUERY_KEY], () => coursesClient.getCourses());
};

export const useGetCourse = (courseId: number) => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return useQuery([COURSE_QUERY_KEY, courseId, 'overview'], () => {
    return coursesClient.getCourse({ courseId: courseId });
  });
};

export const useGetCourseFiles = (courseId: number) => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return useQuery([COURSE_QUERY_KEY, courseId, 'files'], () =>
    coursesClient.getCourseFiles({ courseId: courseId }).then(files => ({
      data: files.data,
    })),
  );
};

export const useGetCourseAssignments = (courseId: number) => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return useQuery([COURSE_QUERY_KEY, courseId, 'assignments'], () =>
    coursesClient.getCourseAssignments({ courseId: courseId }),
  );
};

export const useUploadAssignment = (courseId: number) => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
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
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return useQuery([COURSE_QUERY_KEY, courseId, 'guide'], () =>
    coursesClient.getCourseGuide({ courseId: courseId }),
  );
};

export const useGetCourseNotices = (courseId: number) => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return useQuery([COURSE_QUERY_KEY, courseId, 'notices'], () =>
    coursesClient.getCourseNotices({ courseId: courseId }),
  );
};

export const useGetCourseVirtualClassrooms = (courseId: number) => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
  return useQuery([COURSE_QUERY_KEY, courseId, 'virtual-classrooms'], () =>
    coursesClient.getCourseVirtualClassrooms({ courseId: courseId }),
  );
};

export const useGetCourseVideolectures = (courseId: number) => {
  const {
    clients: { courses: coursesClient },
  } = useApiContext();
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
