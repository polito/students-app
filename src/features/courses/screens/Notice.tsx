import { useMemo } from 'react';
import { ScrollView } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HtmlView } from '@core/components/HtmlView';
import { useGetCourseNotices } from '@core/queries/courses';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { sanitizeHtml } from '@utils/html';

import { CoursesStackParamList } from './createCoursesScreens';

type Props = NativeStackScreenProps<CoursesStackParamList, 'Notice'>;

export const Notice = ({ route }: Props) => {
  const { noticeId, courseId } = route.params;
  const { spacing } = useTheme();
  const noticesQuery = useGetCourseNotices(courseId);
  const html = useMemo(
    () =>
      sanitizeHtml(
        noticesQuery.data?.find(notice => notice.id === noticeId)?.content ??
          '',
      ),
    [noticesQuery, noticeId],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[noticesQuery]} manual />}
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
