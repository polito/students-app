import { NewsApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const NEWS_ITEM_QUERY_PREFIX = 'news';
export const NEWS_QUERY_KEY = [NEWS_ITEM_QUERY_PREFIX];

const useNewsClient = (): NewsApi => {
  return new NewsApi();
};

export const useGetNews = () => {
  const newsClient = useNewsClient();

  return useQuery({
    queryKey: NEWS_QUERY_KEY,
    queryFn: () => newsClient.getNews().then(pluckData),
  });
};

export const useGetNewsItem = (newsItemId: number) => {
  const newsClient = useNewsClient();

  return useQuery({
    queryKey: [NEWS_ITEM_QUERY_PREFIX, newsItemId],
    queryFn: () => newsClient.getNewsItem({ newsItemId }).then(pluckData),
  });
};
