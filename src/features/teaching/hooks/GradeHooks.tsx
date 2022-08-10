import { useQuery } from '@tanstack/react-query';
import { StudentService } from '../../../core/services/StudentService';

export const GRADES_QUERY_KEY = 'grades';

export const useGetGrades = () => {
  return useQuery([GRADES_QUERY_KEY], () => StudentService.getStudentGrades());
};
