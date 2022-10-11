import { useTranslation } from 'react-i18next';
import { Button, ScrollView, View } from 'react-native';

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
    <ScrollView
      refreshControl={createRefreshControl(assignmentsQuery)}
      style={bottomBarAwareStyles}
    >
      <View style={{ margin: spacing[4] }}>
        <Button
          color={colors.primary[600]}
          title={t('Upload assignment')}
          onPress={() =>
            navigation.navigate({
              name: 'CourseAssignmentUpload',
              params: { courseId },
            })
          }
        />
      </View>
      <SectionList>
        {assignmentsQuery.data?.data.map((assignment, index) => (
          <CourseAssignmentListItem
            key={assignment.id}
            item={assignment}
            isDownloaded={index % 3 === 0}
          />
        ))}
      </SectionList>
    </ScrollView>
  );
};
