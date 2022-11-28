import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faFileLines, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { Swipeable } from '@kyupss/native-swipeable';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { List } from '@lib/ui/components/List';
import { SwipeableAction } from '@lib/ui/components/SwipeableAction';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
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
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl {...refreshControl} />}
        contentContainerStyle={bottomBarAwareStyles}
        scrollEnabled={scrollEnabled}
      >
        {assignmentsQuery.data?.data.length > 0 ? (
          <List indented>
            {assignmentsQuery.data?.data.map(assignment =>
              assignment.deletedAt == null ? (
                <Swipeable
                  key={assignment.id}
                  onRef={ref => (swipeableRef.current = ref)}
                  rightContainerStyle={{ backgroundColor: colors.danger[500] }}
                  rightButtons={[
                    <SwipeableAction
                      icon={faTrashCan}
                      label={t('common.retract')}
                      backgroundColor={colors.danger[500]}
                      onPress={() => {
                        swipeableRef.current?.recenter();
                      }}
                    ></SwipeableAction>,
                  ]}
                  onSwipeStart={() => setScrollEnabled(false)}
                  onSwipeComplete={() => setScrollEnabled(true)}
                >
                  <CourseAssignmentListItem item={assignment} />
                </Swipeable>
              ) : (
                <CourseAssignmentListItem item={assignment} />
              ),
            )}
          </List>
        ) : (
          <EmptyState
            message={t('courseAssignmentsTab.emptyState')}
            icon={faFileLines}
          ></EmptyState>
        )}
      </ScrollView>
      <CtaButton
        title={t('courseAssignmentUploadScreen.title')}
        action={() =>
          navigation.navigate({
            name: 'CourseAssignmentUpload',
            params: { courseId },
          })
        }
      />
    </>
  );
};
