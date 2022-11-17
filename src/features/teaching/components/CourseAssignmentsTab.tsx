import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { Swipeable } from '@kyupss/native-swipeable';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { List } from '@lib/ui/components/List';
import { SwipeableAction } from '@lib/ui/components/SwipeableAction';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
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
  const [scollEnabled, setScollEnabled] = useState(true);
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <>
      <ScrollView
        refreshControl={createRefreshControl(assignmentsQuery)}
        contentContainerStyle={bottomBarAwareStyles}
        scrollEnabled={scollEnabled}
      >
        <List indented>
          {assignmentsQuery.data?.data.map(assignment => (
            <Swipeable
              key={assignment.id}
              onRef={ref => (swipeableRef.current = ref)}
              rightContainerStyle={{ backgroundColor: colors.danger[500] }}
              rightButtons={[
                <SwipeableAction
                  icon={faTrashCan}
                  label={t('common.remove')}
                  backgroundColor={colors.danger[500]}
                  onPress={() => {
                    swipeableRef.current?.recenter();
                  }}
                ></SwipeableAction>,
              ]}
              onSwipeStart={() => setScollEnabled(false)}
              onSwipeComplete={() => setScollEnabled(true)}
            >
              <CourseAssignmentListItem item={assignment} />
            </Swipeable>
          ))}
        </List>
      </ScrollView>
      <CtaButton
        title={t('courseAssignmentUploadScreen.title')}
        onPress={() =>
          navigation.navigate({
            name: 'CourseAssignmentUpload',
            params: { courseId },
          })
        }
      />
    </>
  );
};
