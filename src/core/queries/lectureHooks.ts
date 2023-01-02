import { LecturesApi } from '@polito/api-client';
import { GetLecturesRequest } from '@polito/api-client/apis/LecturesApi';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const LECTURES_QUERY_KEY = 'lectures';
export const LECTURES_INFINITE_QUERY_KEY = 'infiniteLectures';

const useLectureClient = (): LecturesApi => {
  const {
    clients: { lectures: lectureClient },
  } = useApiContext();
  return lectureClient;
};

export const useGetLectures = (queryParams?: GetLecturesRequest) => {
  // console.log('useGetLectures', queryParams);
  const lectureClient = useLectureClient();

  return useQuery([LECTURES_QUERY_KEY], () => lectureClient.getLectures());
};

export const useGetInfiniteLectures = (queryParams?: GetLecturesRequest) => {
  const lectureClient = useLectureClient();

  return useInfiniteQuery(
    [LECTURES_INFINITE_QUERY_KEY],
    ({ pageParam = 0 }) => {
      // const { fromDate, toDate } = getFromToDateFromPage(pageParam);
      return lectureClient.getLectures({});
    },
  );
};
