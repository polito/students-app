import { Fragment, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import { List } from '@lib/ui/components/List';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseNotices } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseNoticesTab = ({ courseId }: CourseTabProps) => {
  const { fontSizes, colors, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const noticesQuery = useGetCourseNotices(courseId);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    setNotices(
      noticesQuery.data?.data.map(notice => {
        const { id, content, publishedAt } = notice;
        const dom = parseDocument(content.replace(/\\r+/g, ' '));
        const title = innerText(dom.children as any[]);
        return {
          id,
          publishedAt,
          title,
          content: (
            <RenderHTML
              baseStyle={{
                paddingHorizontal: spacing[5],
                color: colors.prose,
              }}
              source={{ dom }}
            />
          ),
          open: false,
        };
      }) ?? [],
    );
  }, [noticesQuery.data]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={bottomBarAwareStyles}
      refreshControl={createRefreshControl(noticesQuery)}
    >
      <List>
        {notices.map((notice, index) => (
          <Fragment key={notice.id}>
            <ListItem
              title={notice.title}
              subtitle={notice.publishedAt.toLocaleString()}
              onPress={() =>
                setNotices(oldNotices =>
                  oldNotices.map((n, i) =>
                    i === index ? { ...n, open: !n.open } : n,
                  ),
                )
              }
              trailingItem={
                <Ionicons
                  name={
                    notice.open
                      ? 'chevron-down-outline'
                      : 'chevron-forward-outline'
                  }
                  color={colors.secondaryText}
                  size={fontSizes['2xl']}
                  style={{ marginRight: -spacing[1] }}
                />
              }
            />
            {notice.open && notice.content}
          </Fragment>
        ))}
      </List>
    </ScrollView>
  );
};
