import {
  ActionSheetIOS,
  Button,
  Platform,
  ScrollView,
  useColorScheme,
  View,
} from 'react-native';
import { Text } from '@lib/ui/components/Text';
import { TouchableCard } from '@lib/ui/components/TouchableCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { formatFileDate, formatFileSize } from '../../../utils/files';
import { useGetCourseAssignments } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseAssignmentsTab = ({ courseId }: CourseTabProps) => {
  const { spacing } = useTheme();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  const colorScheme = useColorScheme();

  return (
    <ScrollView
      style={[{ paddingHorizontal: spacing[4] }, bottomBarAwareStyles]}
      refreshControl={createRefreshControl(assignmentsQuery)}
    >
      <View style={{ marginVertical: spacing[4] }}>
        <Button title="Invia un elaborato" />
      </View>
      {assignmentsQuery.data?.data.map(assignment => (
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
      ))}
    </ScrollView>
  );
};
