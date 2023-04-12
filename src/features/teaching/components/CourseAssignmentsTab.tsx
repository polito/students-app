import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faFileLines, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { Swipeable } from '@kyupss/native-swipeable';
import { Badge } from '@lib/ui/components/Badge';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { List } from '@lib/ui/components/List';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { SwipeableAction } from '@lib/ui/components/SwipeableAction';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourseAssignments } from '../../../core/queries/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';
import { CourseAssignmentListItem } from './CourseAssignmentListItem';

export const CourseAssignmentsTab = ({
  courseId,
  navigation,
}: CourseTabProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  // @ts-expect-error due to Swipeable lib type patch
  const swipeableRef = useRef<Swipeable>();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const refreshControl = useRefreshControl(assignmentsQuery);
  const { accessibilityListLabel } = useAccessibility();

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl {...refreshControl} />}
        scrollEnabled={scrollEnabled}
      >
        {assignmentsQuery.data &&
          (assignmentsQuery.data.length > 0 ? (
            <List indented>
              {assignmentsQuery.data.map((assignment, index) =>
                assignment.deletedAt == null ? (
                  <Swipeable
                    key={assignment.id}
                    onRef={ref => (swipeableRef.current = ref)}
                    rightContainerStyle={{
                      backgroundColor: colors.danger[500],
                    }}
                    rightButtons={[
                      // eslint-disable-next-line react/jsx-key
                      <SwipeableAction
                        icon={faTrashCan}
                        label={t('common.retract')}
                        backgroundColor={colors.danger[500]}
                        onPress={() => {
                          swipeableRef.current?.recenter();
                        }}
                      />,
                    ]}
                    onSwipeStart={() => setScrollEnabled(false)}
                    onSwipeComplete={() => setScrollEnabled(true)}
                  >
                    <CourseAssignmentListItem
                      item={assignment}
                      accessible={true}
                      accessibilityListLabel={accessibilityListLabel(
                        index,
                        assignmentsQuery?.data.length,
                      )}
                    />
                  </Swipeable>
                ) : (
                  <CourseAssignmentListItem
                    key={assignment.id}
                    item={assignment}
                    accessibilityListLabel={accessibilityListLabel(
                      index,
                      assignmentsQuery.data.length,
                    )}
                  />
                ),
              )}
            </List>
          ) : (
            <EmptyState
              message={t('courseAssignmentsTab.emptyState')}
              icon={faFileLines}
            />
          ))}
      </ScrollView>
      <CtaButton
        title={t('courseAssignmentUploadScreen.title')}
        disabled={true}
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
