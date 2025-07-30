import { EscApi } from '@polito/api-client/apis/EscApi.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries.ts';
import { STUDENT_QUERY_KEY } from './studentHooks.ts';

export const ESC_QUERY_KEY = ['esc'];

export const useEscClient = (): EscApi => {
  return new EscApi();
};

export const useEscGet = () => {
  const escClient = useEscClient();

  return useQuery({
    queryKey: ESC_QUERY_KEY,
    queryFn: () => escClient.escGet().then(pluckData),
    gcTime: Infinity,
  });
};

export const useRequestEsc = () => {
  const escClient = useEscClient();
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => escClient.escRequest(),
    onSuccess: () => {
      return Promise.all([
        client.invalidateQueries({ queryKey: ESC_QUERY_KEY }),
        client.invalidateQueries({ queryKey: STUDENT_QUERY_KEY }),
      ]);
    },
  });
};

export const useDeleteEsc = () => {
  const escClient = useEscClient();
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => escClient.escDelete(),
    onSuccess: () => {
      return Promise.all([
        client.invalidateQueries({ queryKey: ESC_QUERY_KEY }),
        client.invalidateQueries({ queryKey: STUDENT_QUERY_KEY }),
      ]);
    },
  });
};
