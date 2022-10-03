import { BookExamRequest, ExamsApi } from '@polito-it/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const EXAMS_QUERY_KEY = 'exams';

const useExamsClient = (): ExamsApi => {
  const {
    clients: { exams: examsClient },
  } = useApiContext();
  return examsClient;
};

export const useGetExams = () => {
  const examsClient = useExamsClient();

  return useQuery([EXAMS_QUERY_KEY], () => examsClient.getExams());
};

export const useBookExam = (examId: number) => {
  const examsClient = useExamsClient();
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