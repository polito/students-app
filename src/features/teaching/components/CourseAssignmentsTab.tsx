import { FlatList, TouchableHighlight, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@lib/ui/components/Card';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { FlatListItem } from '../../../core/components/FlatListItem';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseAssignments } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

const numColumns = 2;

export const CourseAssignmentsTab = ({ courseId }: CourseTabProps) => {
  const { spacing, colors } = useTheme();
  const assignmentsQuery = useGetCourseAssignments(courseId);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <FlatList
      style={{ flex: 1, paddingHorizontal: spacing[2] }}
      keyExtractor={item => item.id + ''}
      data={assignmentsQuery.data?.data}
      contentContainerStyle={[
        {
          paddingVertical: spacing[5],
        },
        bottomBarAwareStyles,
      ]}
      refreshControl={createRefreshControl(assignmentsQuery)}
      renderItem={({ item: f, index }) => (
        <FlatListItem
          gap={+spacing[5]}
          numColumns={2}
          itemsCount={assignmentsQuery.data?.data?.length}
          index={index}
        >
          <TouchableHighlight>
            <Card style={{ padding: spacing[5] }}>
              <Ionicons
                name="document-outline"
                size={36}
                color={colors.secondaryText}
                style={{ alignSelf: 'center', margin: spacing[8] }}
              />
              <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
                {f.filename}
              </Text>
              <Text variant="secondaryText">
                {f.uploadedAt.toLocaleDateString()}
              </Text>
            </Card>
          </TouchableHighlight>
        </FlatListItem>
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing[5] }} />}
      numColumns={numColumns}
    />
  );
};
