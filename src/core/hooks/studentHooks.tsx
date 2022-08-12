import { useQuery } from '@tanstack/react-query';
import { StudentService } from '../services/StudentService';

export const STUDENT_QUERY_KEY = 'student';

export const useGetStudent = () => {
  return useQuery([STUDENT_QUERY_KEY], () => StudentService.getStudent());
};
