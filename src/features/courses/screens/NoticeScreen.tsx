import { useMemo } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { HtmlView } from '../../../core/components/HtmlView';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
import { linkUrls, sanitizeHtml } from '../../../utils/html';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Notice'>;

export const NoticeScreen = ({ route }: Props) => {
  const { noticeId, courseId } = route.params;
  const { spacing } = useTheme();
  const noticesQuery = useGetCourseNotices(courseId);
  const html = useMemo(
    () =>
      linkUrls(
        sanitizeHtml(
          noticesQuery.data?.find(notice => notice.id === noticeId)?.content ??
            '',
        ),
      ),
    [noticesQuery, noticeId],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[noticesQuery]} manual />}
    >
      <SafeAreaView>
        <HtmlView
          source={{ html }}
          baseStyle={{
            paddingTop: 0,
            paddingHorizontal: spacing[5],
          }}
        />
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
