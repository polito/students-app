import { BookExamRequest } from '@polito-it/api-client/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExamService } from '../services/ExamService';

export const EXAMS_QUERY_KEY = 'exams';

export const useGetExams = () => {
  return useQuery([EXAMS_QUERY_KEY], () => ExamService.getExams());
};

export const useBookExam = (examId: number) => {
  const client = useQueryClient();

  return useMutation(
    (dto?: BookExamRequest) =>
      ExamService.bookExam({ examId: examId, bookExamRequest: dto }),
    {
      onSuccess() {
        return client.invalidateQueries([EXAMS_QUERY_KEY]);
      },
    },
  );
};
