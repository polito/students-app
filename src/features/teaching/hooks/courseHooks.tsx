import { UploadCourseAssignmentRequest } from '@polito-it/api-client/apis/CoursesApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../services/CourseService';
import { useGetExams } from './examHooks';

export const COURSES_QUERY_KEY = 'courses';
export const COURSE_QUERY_KEY = 'course';

export const useGetCourses = () => {
  return useQuery([COURSES_QUERY_KEY], () => CourseService.getCourses());
};

export const useGetCourse = (courseId: number) => {
  return useQuery([COURSE_QUERY_KEY, courseId, 'overview'], () =>
    CourseService.getCourse({ courseId: courseId }),
  );
};

export const useGetCourseFiles = (courseId: number) => {
  return useQuery([COURSE_QUERY_KEY, courseId, 'files'], () =>
    CourseService.getCourseFiles({ courseId: courseId }).then(files => ({
      data: files.data.concat(...files.data).concat(...files.data),
    })),
  );
};

export const useGetCourseAssignments = (courseId: number) => {
  return useQuery([COURSE_QUERY_KEY, courseId, 'assignments'], () =>
    CourseService.getCourseAssignments({ courseId: courseId }),
  );
};

export const useUploadAssignment = (courseId: number) => {
  const client = useQueryClient();

  return useMutation(
    (dto: UploadCourseAssignmentRequest) =>
      CourseService.uploadCourseAssignment(dto),
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
  return useQuery([COURSE_QUERY_KEY, courseId, 'guide'], () =>
    CourseService.getCourseGuide({ courseId: courseId }),
  );
};

export const useGetCourseNotices = (courseId: number) => {
  return useQuery([COURSE_QUERY_KEY, courseId, 'notices'], () =>
    CourseService.getCourseNotices({ courseId: courseId }),
  );
};

export const useGetCourseVirtualClassrooms = (courseId: number) => {
  return useQuery([COURSE_QUERY_KEY, courseId, 'virtual-classrooms'], () =>
    CourseService.getCourseVirtualClassrooms({ courseId: courseId }),
  );
};

export const useGetCourseVideolectures = (courseId: number) => {
  return useQuery([COURSE_QUERY_KEY, courseId, 'videolectures'], () =>
    CourseService.getCourseVideolectures({ courseId: courseId }),
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
