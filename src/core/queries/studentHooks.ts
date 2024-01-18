import { useMemo } from 'react';

import { ExamGrade, Message, Student, StudentApi } from '@polito/api-client';
import { UpdateDevicePreferencesRequest } from '@polito/api-client/apis/StudentApi';
import * as Sentry from '@sentry/react-native';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { DateTime } from 'luxon';

import { unreadMessages } from '../../utils/messages';
import { pluckData } from '../../utils/queries';

export const STUDENT_QUERY_KEY = ['student'];
export const GRADES_QUERY_KEY = ['grades'];
export const PROVISIONAL_GRADES_QUERY_KEY = ['provisionalGrades'];
export const MESSAGES_QUERY_PREFIX = 'messages';
export const MESSAGES_QUERY_KEY = [MESSAGES_QUERY_PREFIX];
export const GUIDES_QUERY_KEY = ['guides'];
export const DEADLINES_QUERY_PREFIX = 'deadlines';

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
        Sentry.setTag('student_degree_id', data.degreeName);
        Sentry.setTag('student_degree_name', data.degreeId);
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

export const useGetProvisionalGrades = () => {
  const studentClient = useStudentClient();

  return useQuery(PROVISIONAL_GRADES_QUERY_KEY, () =>
    studentClient.getStudentProvisionalGrades().then(pluckData),
  );
};

export const useAcceptProvisionalGrade = () => {
  const queryClient = useQueryClient();
  const studentClient = useStudentClient();

  return useMutation(
    (id: number) =>
      studentClient.acceptProvisionalGrade({ provisionalGradeId: id }),
    {
      onSuccess: () =>
        Promise.all([
          queryClient.invalidateQueries(PROVISIONAL_GRADES_QUERY_KEY),
          queryClient.invalidateQueries(GRADES_QUERY_KEY),
        ]),
    },
  );
};

export const useRejectProvisionalGrade = () => {
  const queryClient = useQueryClient();
  const studentClient = useStudentClient();

  return useMutation(
    (id: number) =>
      studentClient.rejectProvisionalGrade({ provisionalGradeId: id }),
    {
      onSuccess: () =>
        Promise.all([
          queryClient.invalidateQueries(PROVISIONAL_GRADES_QUERY_KEY),
        ]),
    },
  );
};

const getDeadlineWeekQueryKey = (since: DateTime) => [
  DEADLINES_QUERY_PREFIX,
  since,
];

const getDeadlineWeekQueryFn = async (
  studentClient: StudentApi,
  since: DateTime,
) => {
  const until = since.plus({ week: 1 });

  return studentClient
    .getDeadlines({
      fromDate: since.toJSDate(),
      toDate: until.toJSDate(),
    })
    .then(pluckData);
};

export const useGetDeadlineWeek = (
  since: DateTime = DateTime.now().startOf('week'),
) => {
  const studentClient = useStudentClient();

  return useQuery(
    getDeadlineWeekQueryKey(since),
    async () => getDeadlineWeekQueryFn(studentClient, since),
    {
      staleTime: Infinity,
    },
  );
};

export const useGetDeadlineWeeks = (
  mondays: DateTime[] = [DateTime.now().startOf('week')],
) => {
  const studentClient = useStudentClient();

  const queries = useQueries({
    queries: (mondays ?? []).map(monday => ({
      queryKey: getDeadlineWeekQueryKey(monday),
      queryFn: async () => getDeadlineWeekQueryFn(studentClient, monday),
    })),
  });

  const isLoading = useMemo(() => {
    return queries.some(query => query.isLoading);
  }, [queries]);

  return {
    data: queries.map(query => query.data!),
    isLoading,
  };
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
      refetchOnWindowFocus: 'always',
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

export const useGetGuides = () => {
  const studentClient = useStudentClient();

  return useQuery(GUIDES_QUERY_KEY, () =>
    studentClient.getGuides().then(pluckData),
  );
};
