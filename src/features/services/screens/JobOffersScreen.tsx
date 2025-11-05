import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetJobOffers } from '../../../core/queries/jobOfferHooks';
import { JobOfferListItem } from '../components/JobOfferListItem';

export const JobOffersScreen = () => {
  const { t } = useTranslation();
  const jobOffersQuery = useGetJobOffers();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[jobOffersQuery]} manual />}
    >
      <SafeAreaView>
        <Section>
          <OverviewList
            loading={jobOffersQuery.isLoading}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel={`${t('jobOffersScreen.jobOffersList')} - ${jobOffersQuery.data?.length || 0} ${t('jobOffersScreen.jobOffersAvailable')}`}
            emptyStateText={t('jobOffersScreen.emptyState')}
          >
            {jobOffersQuery?.data?.map((jobOffer, index) => (
              <JobOfferListItem
                jobOffer={jobOffer}
                key={jobOffer.id}
                index={index}
                totalData={jobOffersQuery.data?.length || 0}
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
