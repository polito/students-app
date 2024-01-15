import { useMemo } from 'react';

import { ExamGrade, Message, Student, StudentApi } from '@polito/api-client';
import { UpdateDevicePreferencesRequest } from '@polito/api-client/apis/StudentApi';
import { ProvisionalGrade } from '@polito/api-client/models/ProvisionalGrade';
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
  // const studentClient = useStudentClient();

  return useQuery(
    PROVISIONAL_GRADES_QUERY_KEY,
    () =>
      [
        {
          id: 5817523,
          examId: 903380,
          courseShortcode: '02JSKOV',
          courseName: 'Human Computer Interaction',
          teacherId: 2154,
          credits: 6,
          grade: '27',
          date: new Date('2022-05-15'),
          state: 'published',
          stateDescription: 'Provvisorio',
          teacherMessage:
            "sono disponibili aggiornamenti dei risultati relativi all'appello del 26/06/2023 per l'insegnamento Il processo logistico (02TGJRY). Alstom mi ha appena trasmesso la valutazione della parte di formazione svolta in azienda (Flusso fisico e contabile di materiale) e, alla luce dell'ottimo giudizio che avete ricevuto, ho ritenuto opportuno confermare i voti conseguiti durante lo svolgimento del case study in aula e già comunicati al termine del mio corso. La registrazione di questi voti verrà consolidata la prossima settimana.",
          isWithdrawn: false,
          isFailure: false,
          canBeAccepted: true,
          canBeRejected: true,
          confirmedAt: new Date('2024-01-15T10:47:21.231Z'),
          rejectedAt: new Date('2024-01-15T10:47:21.231Z'),
          rejectingExpiresAt: new Date('2024-01-15T10:47:21.231Z'),
        },
        {
          id: 5817524,
          examId: 903380,
          courseShortcode: '02JSKOV',
          courseName: 'Software Engineering 2',
          teacherId: 2154,
          credits: 6,
          grade: '27',
          date: new Date('2022-05-15'),
          state: 'confirmed',
          stateDescription: 'Consolidato',
          teacherMessage:
            "sono disponibili aggiornamenti dei risultati relativi all'appello del 26/06/2023 per l'insegnamento Il processo logistico (02TGJRY). Alstom mi ha appena trasmesso la valutazione della parte di formazione svolta in azienda (Flusso fisico e contabile di materiale) e, alla luce dell'ottimo giudizio che avete ricevuto, ho ritenuto opportuno confermare i voti conseguiti durante lo svolgimento del case study in aula e già comunicati al termine del mio corso. La registrazione di questi voti verrà consolidata la prossima settimana.",
          isWithdrawn: false,
          isFailure: false,
          canBeAccepted: true,
          canBeRejected: true,
          confirmedAt: new Date('2024-01-15T10:47:21.231Z'),
          rejectedAt: new Date('2024-01-15T10:47:21.231Z'),
          rejectingExpiresAt: new Date('2024-01-15T16:47:21.231Z'),
        },
        {
          id: 5817525,
          examId: 903380,
          courseShortcode: '02JSKOV',
          courseName: 'Software Engineering 2',
          teacherId: 2154,
          credits: 6,
          grade: '27',
          date: new Date('2022-05-15'),
          state: 'rejected',
          stateDescription: 'Rifiutato',
          teacherMessage:
            "sono disponibili aggiornamenti dei risultati relativi all'appello del 26/06/2023 per l'insegnamento Il processo logistico (02TGJRY). Alstom mi ha appena trasmesso la valutazione della parte di formazione svolta in azienda (Flusso fisico e contabile di materiale) e, alla luce dell'ottimo giudizio che avete ricevuto, ho ritenuto opportuno confermare i voti conseguiti durante lo svolgimento del case study in aula e già comunicati al termine del mio corso. La registrazione di questi voti verrà consolidata la prossima settimana.",
          isWithdrawn: false,
          isFailure: false,
          canBeAccepted: true,
          canBeRejected: true,
          confirmedAt: new Date('2024-01-15T10:47:21.231Z'),
          rejectedAt: new Date('2024-01-15T10:47:21.231Z'),
          rejectingExpiresAt: new Date('2024-01-15T10:47:21.231Z'),
        },
      ] as ProvisionalGrade[],
  );
  // ?() => studentClient.getStudentProvisionalGrades().then(pluckData),);
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
