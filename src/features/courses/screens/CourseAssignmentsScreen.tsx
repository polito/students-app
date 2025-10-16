import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { List } from '@lib/ui/components/List';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { IS_IOS } from '../../../core/constants';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetCourseAssignments } from '../../../core/queries/courseHooks';
import { formatDateTime } from '../../../utils/dates';
import { formatFileSize } from '../../../utils/files';
import { CourseAssignmentListItem } from '../components/CourseAssignmentListItem';
import { useCourseContext } from '../contexts/CourseContext';
import { CourseTabsParamList } from '../navigation/CourseNavigator';

type Props = MaterialTopTabScreenProps<
  CourseTabsParamList,
  'CourseAssignmentsScreen'
>;

export const CourseAssignmentsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const courseId = useCourseContext();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const { accessibilityListLabel } = useAccessibility();
  const isDisabled = useOfflineDisabled();
  const isCacheMissing = useOfflineDisabled(
    () => assignmentsQuery.data === undefined,
  );

  useFocusEffect(
    useCallback(() => {
      if (!assignmentsQuery?.data) {
        return;
      }
      if (assignmentsQuery?.data?.length === 0) {
        setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(
            t('courseAssignmentsTab.emptyState'),
          );
        }, 500);
      }
    }, [assignmentsQuery, t]),
  );

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl manual queries={[assignmentsQuery]} />}
      >
        <SafeAreaView>
          {!assignmentsQuery.isLoading &&
            assignmentsQuery.data &&
            (assignmentsQuery.data.length > 0 ? (
              <List indented>
                {assignmentsQuery.data.map((assignment, index) => (
                  // this pressable is for ios accessibility
                  <Pressable
                    key={assignment.id}
                    accessibilityRole="button"
                    accessibilityLabel={[
                      accessibilityListLabel(
                        index,
                        assignmentsQuery.data.length,
                      ),
                      assignment.description,
                      assignment.deletedAt ? t('common.retracted') : '',
                      `${formatFileSize(
                        assignment.sizeInKiloBytes,
                      )} - ${formatDateTime(assignment.uploadedAt)}`,
                      t('common.downloadClick'),
                      IS_IOS ? t('courseAssignmentsTab.longPress') : '',
                    ].join(', ')}
                  >
                    <CourseAssignmentListItem
                      item={assignment}
                      disabled={isDisabled}
                    />
                  </Pressable>
                ))}
              </List>
            ) : (
              <OverviewList
                emptyStateText={t('courseAssignmentsTab.emptyState')}
              />
            ))}
          {isCacheMissing && (
            <OverviewList emptyStateText={t('common.cacheMiss')} />
          )}
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      <CtaButton
        title={t('courseAssignmentUploadScreen.title')}
        action={() =>
          navigation.navigate({
            name: 'CourseAssignmentUpload',
            params: { courseId },
          })
        }
        disabled={isDisabled}
      />
    </>
  );
};
