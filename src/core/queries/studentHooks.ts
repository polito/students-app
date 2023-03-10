import {
  GetStudent200Response,
  GetStudentGrades200Response,
  StudentApi,
} from '@polito/api-client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { DateTime, Duration } from 'luxon';

import { prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const DEADLINES_QUERY_KEY = 'deadlines';

export const STUDENT_QUERY_KEY = 'student';
export const GRADES_QUERY_KEY = 'grades';

const useStudentClient = (): StudentApi => {
  const {
    clients: { student: studentClient },
  } = useApiContext();
  return studentClient;
};

const handleAcquiredCredits = (response: GetStudent200Response) => {
  if (response.data.totalCredits < response.data.totalAttendedCredits) {
    response.data.totalCredits = response.data.totalAttendedCredits;
  }

  return response;
};

export const useGetStudent = () => {
  const studentClient = useStudentClient();

  return useQuery(prefixKey([STUDENT_QUERY_KEY]), () =>
    studentClient.getStudent().then(s => handleAcquiredCredits(s)),
  );
};

const sortGrades = (response: GetStudentGrades200Response) => {
  response.data = response.data.sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  return response;
};

export const useGetGrades = () => {
  const studentClient = useStudentClient();

  return useQuery(prefixKey([GRADES_QUERY_KEY]), () =>
    studentClient.getStudentGrades().then(sortGrades),
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
        .then(r => r.data);
    },
    {
      staleTime: Infinity,
    },
  );
};
