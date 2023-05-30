import { ScrollView } from 'react-native';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';

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
        <SectionList loading={newsQuery.isLoading}>
          {newsQuery?.data?.map((newsItem, index) => (
            <NewsListItem
              newsItem={newsItem}
              key={newsItem.id}
              index={index}
              totalData={newsQuery?.data?.length || 0}
            />
          ))}
        </SectionList>
      </Section>
    </ScrollView>
  );
};
