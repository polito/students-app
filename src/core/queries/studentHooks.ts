import { ExamGrade, Student, StudentApi } from '@polito/api-client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { DateTime, Duration } from 'luxon';

import { pluckData, prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const DEADLINES_QUERY_KEY = 'deadlines';

export const STUDENT_QUERY_KEY = 'student';
export const GRADES_QUERY_KEY = 'grades';

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
