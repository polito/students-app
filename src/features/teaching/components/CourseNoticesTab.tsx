import { Fragment, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import RenderHTML, { Document } from 'react-native-render-html';

import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { List } from '@lib/ui/components/List';
import { ListItem } from '@lib/ui/components/ListItem';
import { defaultLineHeightMultiplier } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

import { QueryRefreshControl } from '../../../core/components/QueryRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
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
        const dom = parseDocument(
          content.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
        ) as Document;
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
                fontFamily: 'Poppins',
                fontSize: fontSizes.sm,
                lineHeight: fontSizes.sm * defaultLineHeightMultiplier,
              }}
              source={{ dom }}
              systemFonts={['Poppins']}
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
      refreshControl={<QueryRefreshControl queries={[noticesQuery]} />}
    >
      <List dividers>
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
                <Icon
                  icon={notice.open ? faChevronDown : faChevronRight}
                  color={colors.secondaryText}
                  size={fontSizes.lg}
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
