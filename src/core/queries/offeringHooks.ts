import { OfferingApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData, prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const OFFERING_QUERY_KEY = 'offering';
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
