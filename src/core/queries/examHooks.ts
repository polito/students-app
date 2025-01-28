import { Exam as ApiExam, BookExamRequest, ExamsApi } from '@polito/api-client';
import type { RescheduleExamRequest } from '@polito/api-client/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';
import { Exam } from '../types/api';

export const EXAMS_QUERY_KEY = ['exams'];

const useExamsClient = (): ExamsApi => {
  return new ExamsApi();
};

const mapApiExamToExam = (exam: ApiExam): Exam => {
  return {
    ...exam,
    isTimeToBeDefined:
      exam.examStartsAt !== null && exam.examStartsAt.getHours() === 0,
    uniqueShortcode: exam.courseShortcode + exam.moduleNumber,
  };
};

export const useGetExams = () => {
  const examsClient = useExamsClient();

  return useQuery<Exam[]>(EXAMS_QUERY_KEY, () =>
    examsClient
      .getExams()
      .then(pluckData)
      .then(exams =>
        exams
          .map(mapApiExamToExam)
          .sort(
            (a, b) => a.examStartsAt!.valueOf() - b.examStartsAt!.valueOf(),
          ),
      ),
  );
};

export const useBookExam = (examId: number) => {
  const examsClient = useExamsClient();
  const client = useQueryClient();

  return useMutation(
    (dto: BookExamRequest) =>
      examsClient.bookExam({ examId: examId, bookExamRequest: dto }),
    {
      onSuccess() {
        return client.invalidateQueries(EXAMS_QUERY_KEY);
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
        return client.invalidateQueries(EXAMS_QUERY_KEY);
      },
    },
  );
};

export const useRescheduleRequest = (examId: number) => {
  const examsClient = useExamsClient();
  const client = useQueryClient();

  return useMutation(
    (rescheduleReason: RescheduleExamRequest) =>
      examsClient.rescheduleExam({
        examId: examId,
        rescheduleExamRequest: rescheduleReason,
      }),
    {
      onSuccess() {
        return client.invalidateQueries(EXAMS_QUERY_KEY);
      },
    },
  );
};
