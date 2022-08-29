import { ScrollView } from 'react-native';
import { List } from '@lib/ui/components/List';
import { ListItem } from '@lib/ui/components/ListItem';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useGetCourseNotices } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseNoticesTab = ({ courseId }: CourseTabProps) => {
  const noticesQuery = useGetCourseNotices(courseId);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={createRefreshControl(noticesQuery)}
    >
      <List>
        {noticesQuery.data?.data.map(n => (
          <ListItem key={n.id} title={n.content} />
        ))}
      </List>
    </ScrollView>
  );
};
