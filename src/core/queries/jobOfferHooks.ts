import { JobOffersApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const JOB_OFFER_QUERY_PREFIX = 'jobOffers';
export const JOB_OFFERS_QUERY_KEY = [JOB_OFFER_QUERY_PREFIX];
const useJobOffersClient = (): JobOffersApi => {
  return new JobOffersApi();
};

export const useGetJobOffers = () => {
  const jobOffersClient = useJobOffersClient();

  return useQuery({
    queryKey: JOB_OFFERS_QUERY_KEY,
    queryFn: () => jobOffersClient.getJobOffers().then(pluckData),
  });
};

export const useGetJobOffer = (jobOfferId: number) => {
  const jobOffersClient = useJobOffersClient();

  return useQuery({
    queryKey: [JOB_OFFER_QUERY_PREFIX, jobOfferId],
    queryFn: () => jobOffersClient.getJobOffer({ jobOfferId }).then(pluckData),
  });
};
