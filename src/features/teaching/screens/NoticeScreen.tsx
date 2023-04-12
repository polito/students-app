import { useMemo } from 'react';
import { ScrollView } from 'react-native';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HtmlView } from '../../../core/components/HtmlView';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
import { sanitizeHtml } from '../../../utils/html';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Notice'>;

export const NoticeScreen = ({ route }: Props) => {
  const { noticeId, courseId } = route.params;
  const { spacing } = useTheme();
  const noticesQuery = useGetCourseNotices(courseId);
  const refreshControl = useRefreshControl(noticesQuery);
  const html = useMemo(
    () =>
      sanitizeHtml(
        noticesQuery.data?.find(notice => notice.id === noticeId)?.content ??
          '',
      ),
    [noticesQuery, noticeId],
  );

  if (!noticeId) {
    return null;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <HtmlView
        source={{ html }}
        baseStyle={{
          paddingTop: 0,
          paddingHorizontal: spacing[5],
        }}
      />
    </ScrollView>
  );
};
