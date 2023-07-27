import { ExamGrade, Message, Student, StudentApi } from '@polito/api-client';
import { UpdateDevicePreferencesRequest } from '@polito/api-client/apis/StudentApi';
import * as Sentry from '@sentry/react-native';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { DateTime, Duration } from 'luxon';

import { unreadMessages } from '../../utils/messages';
import { pluckData, prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const DEADLINES_QUERY_KEY = 'deadlines';

export const STUDENT_QUERY_KEY = 'student';
export const GRADES_QUERY_KEY = 'grades';
export const MESSAGES_QUERY_KEY = 'messages';

const useStudentClient = (): StudentApi => {
  const {
    clients: { student: studentClient },
  } = useApiContext();
  return studentClient!;
};

const handleAcquiredCredits = (student: Student) => {
  if (student.totalCredits < student.totalAttendedCredits) {
    student.totalCredits = student.totalAttendedCredits;
  }

  return student;
};

export const useGetStudent = () => {
  const studentClient = useStudentClient();

  return useQuery(
    prefixKey([STUDENT_QUERY_KEY]),
    () =>
      studentClient
        .getStudent()
        .then(pluckData)
        .then(handleAcquiredCredits)
        .then(s => {
          s.degreeLevel = s.degreeLevel.replace(/ in$/, '');
          return s;
        }),
    {
      onSuccess: async data => {
        Sentry.setTag('student_degree_code', data.degreeCode);
        Sentry.setTag('student_status', data.status);
        Sentry.setTag(
          'student_is_currently_enrolled',
          data.isCurrentlyEnrolled,
        );
      },
      staleTime: Infinity,
    },
  );
};

const sortGrades = (response: ExamGrade[]) => {
  response = response.sort((a, b) => b.date.getTime() - a.date.getTime());
  return response;
};

export const useGetGrades = () => {
  const studentClient = useStudentClient();

  return useQuery(prefixKey([GRADES_QUERY_KEY]), () =>
    studentClient.getStudentGrades().then(pluckData).then(sortGrades),
  );
};

export const useGetDeadlineWeeks = () => {
  const studentClient = useStudentClient();

  const oneWeek = Duration.fromDurationLike({ week: 1 });

  return useInfiniteQuery(
    prefixKey([DEADLINES_QUERY_KEY]),
    ({ pageParam: since = DateTime.now().startOf('week') }) => {
      const until = since.plus(oneWeek);

      return studentClient
        .getDeadlines({
          fromDate: since.toJSDate(),
          toDate: until.toJSDate(),
        })
        .then(pluckData);
    },
    {
      staleTime: Infinity,
    },
  );
};

export const useUpdateDevicePreferences = () => {
  const studentClient = useStudentClient();
  const queryClient = useQueryClient();

  return useMutation(
    (dto: UpdateDevicePreferencesRequest) =>
      studentClient.updateDevicePreferences(dto),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries([]);
      },
    },
  );
};

export const useGetMessages = () => {
  const queryClient = useQueryClient();
  const studentClient = useStudentClient();
  const messagesQueryKey = prefixKey([MESSAGES_QUERY_KEY]);

  return useQuery(
    messagesQueryKey,
    () =>
      studentClient
        .getMessages()
        .then(pluckData)
        .then(messages => {
          const previousMessages =
            queryClient.getQueryData<Message[]>(messagesQueryKey);

          if (
            previousMessages &&
            unreadMessages(previousMessages).length >=
              unreadMessages(messages).length
          ) {
            return messages;
          }

          queryClient.setQueryData(
            [...messagesQueryKey, 'modal'],
            unreadMessages(messages),
          );

          return messages;
        }),
    {
      staleTime: 300000, // 5 minutes
      refetchInterval: 300000, // 5 minutes
    },
  );
};

export const useInvalidateMessages = () => {
  const queryClient = useQueryClient();
  const messagesQueryKey = prefixKey([MESSAGES_QUERY_KEY]);

  return {
    run: () => queryClient.invalidateQueries(messagesQueryKey),
  };
};

export const useGetModalMessages = () => {
  const messagesQuery = useGetMessages();
  const modalQueryKey = prefixKey([MESSAGES_QUERY_KEY, 'modal']);

  return useQuery(modalQueryKey, () => [], {
    enabled: !!messagesQuery.data,
    staleTime: Infinity,
  });
};

export const useMarkMessageAsRead = (invalidate: boolean = true) => {
  const studentClient = useStudentClient();
  const client = useQueryClient();
  const invalidatesQuery = prefixKey([MESSAGES_QUERY_KEY]);

  return useMutation(
    (messageId: number) => studentClient.markMessageAsRead({ messageId }),
    {
      onSuccess() {
        return invalidate && client.invalidateQueries(invalidatesQuery);
      },
    },
  );
};
