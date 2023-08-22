import { useMemo } from 'react';

import { PeopleApi } from '@polito/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';

import { ignoreNotFound, pluckData } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const PEOPLE_QUERY_KEY = 'people';
export const PERSON_QUERY_KEY = 'person';

const usePeopleClient = (): PeopleApi => {
  const {
    clients: { people: peopleClient },
  } = useApiContext();
  return peopleClient!;
};

export const useGetPeople = (search: string, enabled: boolean) => {
  const peopleClient = usePeopleClient();

  return useQuery(
    [PEOPLE_QUERY_KEY, search],
    () => peopleClient.getPeople({ search }).then(pluckData),
    {
      enabled: enabled,
    },
  );
};

export const useGetPerson = (personId: number | undefined) => {
  const peopleClient = usePeopleClient();

  return useQuery(
    [PERSON_QUERY_KEY, personId],
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
      queryKey: [PERSON_QUERY_KEY, personId],
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
  }, [queries]);

  return { isLoading, queries };
};
