import { BookExamRequest, ExamsApi } from '@polito/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pluckData, prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';
import { Exam } from '../types/api';

export const EXAMS_QUERY_KEY = 'exams';

const useExamsClient = (): ExamsApi => {
  const {
    clients: { exams: examsClient },
  } = useApiContext();
  return examsClient!;
};

export const useGetExams = () => {
  const examsClient = useExamsClient();

  return useQuery<Exam[]>(prefixKey([EXAMS_QUERY_KEY]), () =>
    examsClient
      .getExams()
      .then(pluckData)
      .then(exams =>
        exams.map(exam => ({
          ...exam,
          isTimeToBeDefined:
            exam.examStartsAt !== null && exam.examStartsAt.getHours() === 0,
        })),
      )
      .then(exams =>
        exams.sort(
          (a, b) => a.examStartsAt!.valueOf() - b.examStartsAt!.valueOf(),
        ),
      ),
  );
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
