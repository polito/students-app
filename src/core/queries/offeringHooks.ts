import { OfferingApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { compact } from 'lodash';

import { pluckData } from '../../utils/queries';

export const OFFERING_QUERY_KEY = ['offering'];
export const DEGREES_QUERY_PREFIX = 'degrees';
export const COURSES_QUERY_PREFIX = 'courses';
const useOfferingClient = (): OfferingApi => {
  return new OfferingApi();
};

export const useGetOffering = () => {
  const offeringClient = useOfferingClient();

  return useQuery(OFFERING_QUERY_KEY, () =>
    offeringClient.getOffering().then(pluckData),
  );
};

export const useGetOfferingDegree = ({
  degreeId,
  year,
}: {
  degreeId: string;
  year?: string;
}) => {
  const offeringClient = useOfferingClient();

  return useQuery(compact([DEGREES_QUERY_PREFIX, degreeId, year]), () =>
    offeringClient.getOfferingDegree({ degreeId, year }).then(pluckData),
  );
};

export const useGetOfferingCourse = ({
  courseShortcode,
  year,
}: {
  courseShortcode: string;
  year?: string;
}) => {
  const offeringClient = useOfferingClient();

  return useQuery(
    compact([
      DEGREES_QUERY_PREFIX,
      COURSES_QUERY_PREFIX,
      courseShortcode,
      year,
    ]),
    () =>
      offeringClient
        .getOfferingCourse({ courseShortcode, year })
        .then(pluckData)
        .then(course => {
          const { teachingPeriod } = course;
          const period = teachingPeriod.split('-');
          if (period.length > 1 && period[0] === period[1]) {
            course.teachingPeriod = period[0];
          }
          return course;
        }),
  );
};
