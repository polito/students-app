import { JobOffersApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData, prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const JOB_OFFERS_QUERY_KEY = 'jobOffers';
const useJobOffersClient = (): JobOffersApi => {
  const {
    clients: { jobOffers: jobOffersClient },
  } = useApiContext();
  return jobOffersClient!;
};

export const useGetJobOffers = () => {
  const jobOffersClient = useJobOffersClient();

  return useQuery(prefixKey([JOB_OFFERS_QUERY_KEY]), () =>
    jobOffersClient.getJobOffers().then(pluckData),
  );
};

export const useGetJobOffer = (jobOfferId: number) => {
  const jobOffersClient = useJobOffersClient();

  return useQuery(prefixKey([JOB_OFFERS_QUERY_KEY, jobOfferId]), () =>
    jobOffersClient.getJobOffer({ jobOfferId }).then(pluckData),
  );
};
