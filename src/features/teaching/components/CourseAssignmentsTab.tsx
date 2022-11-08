import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { SectionList } from '@lib/ui/components/SectionList';
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
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <>
      <ScrollView
        refreshControl={createRefreshControl(assignmentsQuery)}
        contentContainerStyle={bottomBarAwareStyles}
      >
        <SectionList indented>
          {assignmentsQuery.data?.data.map((assignment, index) => (
            <CourseAssignmentListItem
              key={assignment.id}
              item={assignment}
              isDownloaded={index % 3 === 0}
            />
          ))}
        </SectionList>
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
