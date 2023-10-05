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
import { pluckData } from '../../utils/queries';

export const DEADLINES_QUERY_KEY = ['deadlines'];

export const STUDENT_QUERY_KEY = ['student'];
export const GRADES_QUERY_KEY = ['grades'];
export const MESSAGES_QUERY_PREFIX = 'messages';
export const MESSAGES_QUERY_KEY = [MESSAGES_QUERY_PREFIX];

const useStudentClient = (): StudentApi => {
  return new StudentApi();
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
    STUDENT_QUERY_KEY,
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
      cacheTime: Infinity,
    },
  );
};

const sortGrades = (response: ExamGrade[]) => {
  response = response.sort((a, b) => b.date.getTime() - a.date.getTime());
  return response;
};

export const useGetGrades = () => {
  const studentClient = useStudentClient();

  return useQuery(GRADES_QUERY_KEY, () =>
    studentClient.getStudentGrades().then(pluckData).then(sortGrades),
  );
};

export const useGetDeadlineWeeks = () => {
  const studentClient = useStudentClient();

  const oneWeek = Duration.fromDurationLike({ week: 1 });

  return useInfiniteQuery(
    DEADLINES_QUERY_KEY,
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

  return useQuery(
    MESSAGES_QUERY_KEY,
    () =>
      studentClient
        .getMessages()
        .then(pluckData)
        .then(messages => {
          const previousMessages =
            queryClient.getQueryData<Message[]>(MESSAGES_QUERY_KEY);

          if (
            previousMessages &&
            unreadMessages(previousMessages).length >=
              unreadMessages(messages).length
          ) {
            return messages;
          }

          queryClient.setQueryData(
            [MESSAGES_QUERY_PREFIX, 'modal'],
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

  return {
    run: () => queryClient.invalidateQueries(MESSAGES_QUERY_KEY),
  };
};

export const useGetModalMessages = () => {
  const messagesQuery = useGetMessages();

  return useQuery([MESSAGES_QUERY_PREFIX, 'modal'], () => [], {
    enabled: !!messagesQuery.data,
    staleTime: Infinity,
  });
};

export const useMarkMessageAsRead = (invalidate: boolean = true) => {
  const studentClient = useStudentClient();
  const client = useQueryClient();

  return useMutation(
    (messageId: number) => studentClient.markMessageAsRead({ messageId }),
    {
      onSuccess() {
        return invalidate && client.invalidateQueries(MESSAGES_QUERY_KEY);
      },
    },
  );
};
