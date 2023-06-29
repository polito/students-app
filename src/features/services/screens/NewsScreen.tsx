import { ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';

import { useGetNews } from '../../../core/queries/newsHooks';
import { NewsListItem } from '../components/NewsListItem';

export const NewsScreen = () => {
  const newsQuery = useGetNews();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[newsQuery]} manual />}
    >
      <Section>
        <OverviewList loading={newsQuery.isLoading}>
          {newsQuery?.data?.map((newsItem, index) => (
            <NewsListItem
              newsItem={newsItem}
              key={newsItem.id}
              index={index}
              totalData={newsQuery?.data?.length || 0}
            />
          ))}
        </OverviewList>
      </Section>
    </ScrollView>
  );
};
