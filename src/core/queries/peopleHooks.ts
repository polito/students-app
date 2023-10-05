import { useMemo } from 'react';

import { PeopleApi } from '@polito/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';

import { ignoreNotFound, pluckData } from '../../utils/queries';

export const PEOPLE_QUERY_PREFIX = 'people';
export const PERSON_QUERY_PREFIX = 'person';

const usePeopleClient = (): PeopleApi => {
  return new PeopleApi();
};

export const useGetPeople = (search: string, enabled: boolean) => {
  const peopleClient = usePeopleClient();

  return useQuery(
    [PEOPLE_QUERY_PREFIX, search],
    () => peopleClient.getPeople({ search }).then(pluckData),
    {
      enabled: enabled,
    },
  );
};

export const getPersonKey = (personId: number) => [
  PERSON_QUERY_PREFIX,
  personId,
];

export const useGetPerson = (personId: number | undefined) => {
  const peopleClient = usePeopleClient();

  return useQuery(
    getPersonKey(personId!),
    () =>
      peopleClient
        .getPerson({ personId: personId! })
        .then(pluckData)
        .catch(ignoreNotFound),
    {
      enabled: personId !== undefined,
      staleTime: Infinity,
    },
  );
};

export const useGetPersons = (personIds: number[] | undefined) => {
  const peopleClient = usePeopleClient();

  const queries = useQueries({
    queries: (personIds ?? []).map(personId => ({
      queryKey: [PERSON_QUERY_PREFIX, personId],
      queryFn: () =>
        peopleClient
          .getPerson({ personId })
          .then(pluckData)
          .catch(ignoreNotFound),
      staleTime: Infinity,
    })),
  });

  const isLoading = useMemo(() => {
    if (!personIds) return true;
    return queries.some(q => q.isLoading);
  }, [personIds, queries]);

  return { isLoading, queries };
};
