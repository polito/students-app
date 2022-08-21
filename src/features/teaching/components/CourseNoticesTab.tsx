import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { List } from '@lib/ui/components/List';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useGetCourseNotices } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseNoticesTab = ({
  courseId,
  setIsRefreshing,
  shouldRefresh,
}: CourseTabProps) => {
  const { spacing } = useTheme();
  const {
    data: noticesResponse,
    isLoading,
    refetch,
  } = useGetCourseNotices(courseId);

  useEffect(() => setIsRefreshing(isLoading), [isLoading]);

  useEffect(() => {
    if (shouldRefresh) {
      refetch();
    }
  }, [shouldRefresh]);

  return (
    <View>
      {isLoading ? (
        <ActivityIndicator style={{ marginVertical: spacing[8] }} />
      ) : (
        <List>
          {noticesResponse.data.map(n => (
            <ListItem key={n.id} title={n.content} />
          ))}
        </List>
      )}
    </View>
  );
};
