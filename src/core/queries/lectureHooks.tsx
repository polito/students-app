import { LecturesApi } from '@polito-it/api-client';
import { useQuery } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const LECTURES_QUERY_KEY = 'lectures';

const useLectureClient = (): LecturesApi => {
  const {
    clients: { lectures: lectureClient },
  } = useApiContext();
  return lectureClient;
};

export const useGetLectures = () => {
  const lectureClient = useLectureClient();

  return useQuery([LECTURES_QUERY_KEY], () => lectureClient.getLectures());
};
