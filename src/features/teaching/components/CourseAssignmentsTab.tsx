import { useTranslation } from 'react-i18next';
import {
  ActionSheetIOS,
  Button,
  FlatList,
  Platform,
  View,
  useColorScheme,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Text } from '@lib/ui/components/Text';
import { TouchableCard } from '@lib/ui/components/TouchableCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseAssignment } from '@polito-it/api-client';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseAssignments } from '../../../core/queries/courseHooks';
import { formatFileDate, formatFileSize } from '../../../utils/files';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseAssignmentsTab = ({
  courseId,
  navigation,
}: CourseTabProps) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <FlatList
      keyExtractor={a => `${a.id}`}
      data={assignmentsQuery.data?.data ?? []}
      style={[{ paddingHorizontal: spacing[5] }, bottomBarAwareStyles]}
      refreshControl={createRefreshControl(assignmentsQuery)}
      renderItem={({ item, index }) => (
        <CourseAssignmentCard
          assignment={item}
          isDownloaded={index % 3 === 0}
        />
      )}
      ListHeaderComponent={
        <View style={{ marginVertical: spacing[4] }}>
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
      }
    />
  );
};

interface AssignmentProps {
  assignment: CourseAssignment;
  isDownloaded: boolean;
}

const CourseAssignmentCard = ({
  assignment,
  isDownloaded,
}: AssignmentProps) => {
  const { colors, spacing } = useTheme();
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
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            variant="headline"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ flex: 1 }}
          >
            {assignment.filename}
          </Text>
          {isDownloaded && (
            <Text style={{ color: colors.secondary[600] }}>
              <Ionicons name="md-download-outline" size={20} />
            </Text>
          )}
        </View>
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
