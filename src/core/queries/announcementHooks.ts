import {
  AnnouncementScope,
  AnnouncementsApi,
} from '@polito/student-api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const ANNOUNCEMENTS_QUERY_PREFIX = 'announcements';
export const ANNOUNCEMENTS_QUERY_KEY = [ANNOUNCEMENTS_QUERY_PREFIX];

const useAnnouncementsClient = (): AnnouncementsApi => {
  return new AnnouncementsApi();
};

export const useGetAnnouncements = () => {
  const client = useAnnouncementsClient();

  return useQuery({
    queryKey: ANNOUNCEMENTS_QUERY_KEY,
    queryFn: () => {
      return client.getAnnouncements().then(pluckData);
    },
  });
};

export const useGetOnboardingAnnouncements = () => {
  const client = useAnnouncementsClient();

  return useQuery({
    queryKey: [...ANNOUNCEMENTS_QUERY_KEY, 'onboarding'],
    queryFn: () => {
      return client
        .getAnnouncements()
        .then(pluckData)
        .then(data =>
          data.filter(a => a.scope === AnnouncementScope.Onboarding),
        );
    },
  });
};

export const useMarkAnnouncementAsRead = () => {
  const client = useAnnouncementsClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) => {
      return client.markAnnouncementAsRead({ announcementId });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY }),
  });
};
