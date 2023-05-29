import { NewsApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData, prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const NEWS_QUERY_KEY = 'news';

const useNewsClient = (): NewsApi => {
  const {
    clients: { news: newsClient },
  } = useApiContext();
  return newsClient!;
};

export const useGetNews = () => {
  const newsClient = useNewsClient();

  return useQuery(prefixKey([NEWS_QUERY_KEY]), () =>
    newsClient.getNews().then(pluckData),
  );
};

export const useGetNewsItem = (newsItemId: number) => {
  const newsClient = useNewsClient();

  return useQuery(prefixKey([NEWS_QUERY_KEY, newsItemId]), () =>
    newsClient.getNewsItem({ newsItemId }).then(pluckData),
  );
};
