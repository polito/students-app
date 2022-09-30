import { BookExamRequest } from '@polito-it/api-client/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const EXAMS_QUERY_KEY = 'exams';

export const useGetExams = () => {
  const {
    clients: { exams: examsClient },
  } = useApiContext();
  return useQuery([EXAMS_QUERY_KEY], () => examsClient.getExams());
};

export const useBookExam = (examId: number) => {
  const {
    clients: { exams: examsClient },
  } = useApiContext();
  const client = useQueryClient();

  return useMutation(
    (dto?: BookExamRequest) =>
      examsClient.bookExam({ examId: examId, bookExamRequest: dto }),
    {
      onSuccess() {
        return client.invalidateQueries([EXAMS_QUERY_KEY]);
      },
    },
  );
};
