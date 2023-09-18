import { OfferingApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { compact } from 'lodash';

import { pluckData, prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const OFFERING_QUERY_KEY = 'offering';
export const DEGREES_QUERY_KEY = 'degrees';
export const COURSES_QUERY_KEY = 'courses';
const useOfferingClient = (): OfferingApi => {
  const {
    clients: { offering: offeringClient },
  } = useApiContext();
  return offeringClient!;
};

export const useGetOffering = () => {
  const offeringClient = useOfferingClient();

  return useQuery(prefixKey([OFFERING_QUERY_KEY]), () =>
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

  return useQuery(prefixKey(compact([DEGREES_QUERY_KEY, degreeId, year])), () =>
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
    prefixKey(
      compact([DEGREES_QUERY_KEY, COURSES_QUERY_KEY, courseShortcode, year]),
    ),
    () => offeringClient.getOfferingCourse({ courseShortcode, year }),
  );
};
