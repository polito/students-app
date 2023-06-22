import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { List } from '@lib/ui/components/List';
import { RefreshControl } from '@lib/ui/components/RefreshControl';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useGetCourseAssignments } from '../../../core/queries/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';
import { CourseAssignmentListItem } from './CourseAssignmentListItem';

export const CourseAssignmentsTab = ({
  courseId,
  navigation,
}: CourseTabProps) => {
  const { t } = useTranslation();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const { accessibilityListLabel } = useAccessibility();

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl queries={[assignmentsQuery]} />}
      >
        <SafeAreaView>
          {assignmentsQuery.data &&
            (assignmentsQuery.data.length > 0 ? (
              <List indented>
                {assignmentsQuery.data.map((assignment, index) => (
                  <CourseAssignmentListItem
                    key={assignment.id}
                    item={assignment}
                    accessibilityListLabel={accessibilityListLabel(
                      index,
                      assignmentsQuery.data.length,
                    )}
                  />
                ))}
              </List>
            ) : (
              <EmptyState
                message={t('courseAssignmentsTab.emptyState')}
                icon={faFileLines}
              />
            ))}
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      <CtaButton
        title={t('courseAssignmentUploadScreen.title')}
        disabled
        rightExtra={
          <Badge text={t('common.comingSoon')} style={{ marginLeft: 10 }} />
        }
        action={() =>
          navigation!.navigate({
            name: 'CourseAssignmentUpload',
            params: { courseId },
          })
        }
      />
    </>
  );
};
