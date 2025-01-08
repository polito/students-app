import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, FlatList } from 'react-native';

import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';

import { DateTime, IANAZone } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useOnLeaveScreen } from '../../../core/hooks/useOnLeaveScreen';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatDate } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';
import { useCourseContext } from '../contexts/CourseContext';

export const CourseNoticesScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const courseId = useCourseContext();
  const noticesQuery = useGetCourseNotices(courseId);
  const { accessibilityListLabel } = useAccessibility();
  const { getUnreadsCount, clearNotificationScope } = useNotifications();
  const { paddingHorizontal } = useSafeAreaSpacing();
  const isCacheMissing = useOfflineDisabled(
    () => noticesQuery.data === undefined,
  );
  const notices = useMemo(
    () =>
      noticesQuery.data?.map(notice => ({
        ...notice,
        title: getHtmlTextContent(notice.content),
      })) ?? [],
    [noticesQuery],
  );
  const noticesNotificationScope = useMemo(
    () => ['teaching', 'courses', courseId.toString(), 'notices'],
    [courseId],
  );

  useOnLeaveScreen(() => {
    clearNotificationScope(noticesNotificationScope);
  });

  useFocusEffect(
    useCallback(() => {
      if (!notices || notices?.length === 0) {
        setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(
            t('courseNoticesTab.emptyState'),
          );
        }, 500);
      }
    }, [notices]),
  );

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      initialNumToRender={15}
      style={GlobalStyles.grow}
      contentContainerStyle={paddingHorizontal}
      refreshControl={<RefreshControl manual queries={[noticesQuery]} />}
      data={notices}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item: notice, index }) => (
        <ListItem
          title={notice.title}
          accessibilityLabel={`${t(
            accessibilityListLabel(index, notices?.length || 0),
          )}. ${DateTime.fromJSDate(notice.publishedAt, {
            zone: IANAZone.create('Europe/Rome'),
          }).toFormat('dd/MM/yyyy')}, ${notice.title}`}
          subtitle={formatDate(notice.publishedAt)}
          linkTo={{
            screen: 'Notice',
            params: { noticeId: notice.id, courseId },
          }}
          unread={!!getUnreadsCount([...noticesNotificationScope, notice.id])}
        />
      )}
      ListFooterComponent={<BottomBarSpacer />}
      ItemSeparatorComponent={() => <IndentedDivider indent={spacing[5]} />}
      ListEmptyComponent={() => {
        if (!noticesQuery.isLoading) {
          return (
            <EmptyState
              icon={faInbox}
              message={t('courseNoticesTab.emptyState')}
            />
          );
        } else if (isCacheMissing) {
          return <EmptyState icon={faInbox} message={t('common.cacheMiss')} />;
        }
        return null;
      }}
    />
  );
};
