import { StudentApi } from '@polito-it/api-client';
import { useQuery } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const STUDENT_QUERY_KEY = 'student';
export const GRADES_QUERY_KEY = 'grades';

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