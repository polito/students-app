import { useEffect } from 'react';
import { TouchableHighlight } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useGetCourseFiles } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseFilesTab = ({
  courseId,
  setIsRefreshing,
  shouldRefresh,
}: CourseTabProps) => {
  const { spacing, colors } = useTheme();
  const {
    data: filesResponse,
    isLoading,
    refetch,
  } = useGetCourseFiles(courseId);

  useEffect(() => setIsRefreshing(isLoading), [isLoading]);

  useEffect(() => {
    if (shouldRefresh) {
      refetch();
    }
  }, [shouldRefresh]);

  return (
    <Grid style={{ padding: spacing[5] }}>
      {filesResponse?.data.map(f => (
        <TouchableHighlight key={f.id} style={{ flex: 1 }}>
          <Card style={{ padding: spacing[5] }}>
            <Ionicons
              name={
                f.type === 'directory' ? 'folder-outline' : 'document-outline'
              }
              size={36}
              color={colors.secondaryText}
              style={{ alignSelf: 'center', margin: spacing[8] }}
            />
            <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
              {f.name}
            </Text>
            <Text variant="secondaryText">{f.files?.length ?? 'test'}</Text>
          </Card>
        </TouchableHighlight>
      ))}
    </Grid>
  );
};
