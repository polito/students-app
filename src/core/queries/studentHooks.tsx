import {
  GetStudent200Response,
  GetStudentGrades200Response,
  StudentApi,
} from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const STUDENT_QUERY_KEY = 'student';
export const GRADES_QUERY_KEY = 'grades';

const useStudentClient = (): StudentApi => {
  const {
    clients: { student: studentClient },
  } = useApiContext();
  return studentClient;
};

const handleAcquiredCredits = (response: GetStudent200Response) => {
  if (response.data.totalCredits < response.data.totalAttendedCredits) {
    response.data.totalCredits = response.data.totalAttendedCredits;
  }

  return response;
};

export const useGetStudent = () => {
  const studentClient = useStudentClient();

  return useQuery(prefixKey([STUDENT_QUERY_KEY]), () =>
    studentClient.getStudent().then(s => handleAcquiredCredits(s)),
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
