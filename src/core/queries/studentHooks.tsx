import { StudentApi } from '@polito/api-client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getFromToDateFromPage } from '../agenda';
import { useApiContext } from '../contexts/ApiContext';

export const STUDENT_QUERY_KEY = 'student';
export const GRADES_QUERY_KEY = 'grades';
export const DEADLINES_QUERY_KEY = 'deadlines';
export const DEADLINES_INFINITE_QUERY_KEY = 'deadlinesInfinite';

const useStudentClient = (): StudentApi => {
  const {
    clients: { student: studentClient },
  } = useApiContext();
  return studentClient;
};

export const useGetStudent = () => {
  const studentClient = useStudentClient();

  return useQuery([STUDENT_QUERY_KEY], () => studentClient.getStudent());
};

export const useGetGrades = () => {
  const studentClient = useStudentClient();

  return useQuery([GRADES_QUERY_KEY], () => studentClient.getStudentGrades());
};

export const useGetDeadlines = () => {
  const studentClient = useStudentClient();

  return useQuery([DEADLINES_QUERY_KEY], () => studentClient.getDeadlines());
};

export const useGetInfiniteDeadlines = () => {
  const studentClient = useStudentClient();

  return useInfiniteQuery(
    [DEADLINES_INFINITE_QUERY_KEY],
    ({ pageParam = 0 }) => {
      const { fromDate, toDate } = getFromToDateFromPage(pageParam);
      return studentClient.getDeadlines({ fromDate, toDate });
    },
  );
};
