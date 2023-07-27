import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faCircleMinus,
  faCircleXmark,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import {
  Exam as ApiExam,
  BookExamRequest,
  ExamStatusEnum,
  ExamsApi,
} from '@polito/api-client';
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

const mapApiExamToExam = (exam: ApiExam): Exam => {
  let statusIcon: IconDefinition;

  switch (exam.status) {
    case ExamStatusEnum.Booked:
    case ExamStatusEnum.RequestAccepted:
      statusIcon = faCircleCheck;
      break;
    case ExamStatusEnum.Requested:
      statusIcon = faSpinner;
      break;
    case ExamStatusEnum.RequestRejected:
      statusIcon = faCircleXmark;
      break;
    case ExamStatusEnum.Unavailable:
      statusIcon = faCircleMinus;
      break;
    default:
      statusIcon = faCircle;
      break;
  }

  return {
    ...exam,
    isTimeToBeDefined:
      exam.examStartsAt !== null && exam.examStartsAt.getHours() === 0,
    statusIcon,
  };
};

export const useGetExams = () => {
  const examsClient = useExamsClient();

  return useQuery<Exam[]>(prefixKey([EXAMS_QUERY_KEY]), () =>
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

  const examsQueryKey = prefixKey([EXAMS_QUERY_KEY]);

  return useMutation(
    (dto?: BookExamRequest) =>
      examsClient.bookExam({ examId: examId, bookExamRequest: dto }),
    {
      onSuccess() {
        return client.invalidateQueries(examsQueryKey);
      },
    },
  );
};

export const useCancelExamBooking = (examId: number) => {
  const examsClient = useExamsClient();
  const client = useQueryClient();

  const examsQueryKey = prefixKey([EXAMS_QUERY_KEY]);

  return useMutation(
    () => examsClient.deleteExamBookingById({ examId: examId }),
    {
      onSuccess() {
        return client.invalidateQueries(examsQueryKey);
      },
    },
  );
};
