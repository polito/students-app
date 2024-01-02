import { Degree as ApiDegree, OfferingApi } from '@polito/api-client';
import { MenuAction } from '@react-native-menu/menu';
import { useQuery } from '@tanstack/react-query';

import { compact } from 'lodash';

import { Degree } from '../../features/offering/types/Degree';
import { getShortYear } from '../../utils/offerings';
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

const mapDegreeToOfferingDegree = (degree: ApiDegree): Degree => ({
  ...degree,
  editions: degree.editions.map(edition => {
    const degreeYear = Number(edition);
    const previousDegreeYear = degreeYear - 1;

    return {
      id: edition,
      title: `${previousDegreeYear}/${getShortYear(degreeYear)}`,
      state: degreeYear === degree.year ? 'on' : undefined,
    } as MenuAction;
  }),
});

export const useGetOfferingDegree = ({
  degreeId,
  year,
}: {
  degreeId: string;
  year?: string;
}) => {
  const offeringClient = useOfferingClient();

  return useQuery(compact([DEGREES_QUERY_PREFIX, degreeId, year]), () =>
    offeringClient
      .getOfferingDegree({ degreeId, year })
      .then(pluckData)
      .then(mapDegreeToOfferingDegree),
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
