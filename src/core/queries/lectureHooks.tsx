import { LecturesApi } from '@polito-it/api-client';
import { GetLecturesRequest } from '@polito-it/api-client/apis/LecturesApi';
import { useQuery } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const LECTURES_QUERY_KEY = 'lectures';

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
