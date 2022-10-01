import {
  ActionSheetIOS,
  Button,
  FlatList,
  Platform,
  View,
  useColorScheme,
} from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { TouchableCard } from '@lib/ui/components/TouchableCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseAssignment } from '@polito-it/api-client';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseAssignments } from '../../../core/queries/courseHooks';
import { formatFileDate, formatFileSize } from '../../../utils/files';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseAssignmentsTab = ({ courseId }: CourseTabProps) => {
  const { spacing } = useTheme();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <FlatList
      keyExtractor={a => `${a.id}`}
      data={assignmentsQuery.data?.data ?? []}
      style={[{ paddingHorizontal: spacing[5] }, bottomBarAwareStyles]}
      refreshControl={createRefreshControl(assignmentsQuery)}
      renderItem={({ item }) => <CourseAssignmentCard assignment={item} />}
      ListHeaderComponent={
        <View style={{ marginVertical: spacing[4] }}>
          <Button title="Invia un elaborato" />
        </View>
      }
    />
  );
};

interface AssignmentProps {
  assignment: CourseAssignment;
}

const CourseAssignmentCard = ({ assignment }: AssignmentProps) => {
  const { spacing } = useTheme();
  const colorScheme = useColorScheme();

  return (
    <TouchableCard
      key={assignment.id}
      style={{ marginBottom: spacing[4] }}
      cardStyle={{
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
      }}
      onPress={() => {}}
      onLongPress={() => {
        switch (Platform.OS) {
          case 'ios':
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: ['Cancel', 'Delete assignment', 'Download'],
                destructiveButtonIndex: 1,
                cancelButtonIndex: 0,
                userInterfaceStyle: colorScheme,
              },
              buttonIndex => {
                if (buttonIndex === 0) {
                  // TODO cancel sheet
                } else if (buttonIndex === 1) {
                  // TODO delete assignment
                } else if (buttonIndex === 2) {
                  // TODO download assignment
                }
              },
            );
            break;
          default:
            break;
        }
      }}
    >
      <View style={{ marginBottom: spacing[2] }}>
        <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
          {assignment.filename}
        </Text>
        <Text variant="secondaryText">{assignment.description}</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text variant="secondaryText">
          {formatFileDate(assignment.uploadedAt)}
        </Text>
        <Text variant="secondaryText">
          {formatFileSize(assignment.sizeInKiloBytes)}
        </Text>
      </View>
    </TouchableCard>
  );
};
