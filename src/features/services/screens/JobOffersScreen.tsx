import { ScrollView } from 'react-native';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';

import { useGetJobOffers } from '../../../core/queries/jobOfferHooks';
import { JobOfferListItem } from '../components/JobOfferListItem';

export const JobOffersScreen = () => {
  const jobOffersQuery = useGetJobOffers();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[jobOffersQuery]} manual />}
    >
      <Section>
        <SectionList>
          {jobOffersQuery?.data?.map((jobOffer, index) => (
            <JobOfferListItem
              jobOffer={jobOffer}
              key={jobOffer.id}
              index={index}
              totalData={jobOffersQuery.data?.length || 0}
            />
          ))}
        </SectionList>
      </Section>
    </ScrollView>
  );
};
