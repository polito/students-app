import { BookExamRequest, ExamsApi } from '@polito/api-client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const EXAMS_QUERY_KEY = 'exams';
export const EXAMS_INFINITE_QUERY_KEY = 'examsInfinite';

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

export const useGetInfiniteExams = () => {
  const examsClient = useExamsClient();

  return useInfiniteQuery([EXAMS_INFINITE_QUERY_KEY], ({ pageParam = 0 }) => {
    // const {fromDate, toDate} = getFromToDateFromPage(pageParam)
    return examsClient.getExams();
  });
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

export const useCancelExamBooking = (examId: number) => {
  const examsClient = useExamsClient();
  const client = useQueryClient();

  return useMutation(
    () => examsClient.deleteExamBookingById({ examId: examId }),
    {
      onSuccess() {
        return client.invalidateQueries([EXAMS_QUERY_KEY]);
      },
    },
  );
};
