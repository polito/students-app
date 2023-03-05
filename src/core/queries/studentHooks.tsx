import { GetStudentGrades200Response, StudentApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const STUDENT_QUERY_KEY = 'student';
export const GRADES_QUERY_KEY = 'grades';
export const DEADLINES_QUERY_KEY = 'deadlines';

const useStudentClient = (): StudentApi => {
  const {
    clients: { student: studentClient },
  } = useApiContext();
  return studentClient;
};

export const useGetStudent = () => {
  const studentClient = useStudentClient();

  return useQuery(prefixKey([STUDENT_QUERY_KEY]), () =>
    studentClient.getStudent(),
  );
};

const sortGrades = (response: GetStudentGrades200Response) => {
  response.data = response.data.sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  return response;
};

export const useGetGrades = () => {
  const studentClient = useStudentClient();

  return useQuery(prefixKey([GRADES_QUERY_KEY]), () =>
    studentClient.getStudentGrades().then(sortGrades),
  );
};

export const useGetDeadlines = () => {
  const studentClient = useStudentClient();

  return useQuery([DEADLINES_QUERY_KEY], () => studentClient.getDeadlines());
};
