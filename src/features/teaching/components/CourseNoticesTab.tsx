import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';
import { Document } from 'react-native-render-html';

import {
  faChevronDown,
  faChevronUp,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { List } from '@lib/ui/components/List';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';
import { DateTime } from 'luxon';

import { HtmlView } from '../../../core/components/HtmlView';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { formatDate } from '../../../utils/dates';
import { CourseTabProps } from '../screens/CourseScreen';

interface RenderedNotice {
  id: number;
  publishedAt: Date;
  title: string;
  content: JSX.Element;
  open: boolean;
}

export const CourseNoticesTab = ({ courseId }: CourseTabProps) => {
  const { fontSizes, colors, spacing } = useTheme();
  const { t } = useTranslation();
  const noticesQuery = useGetCourseNotices(courseId);
  const refreshControl = useRefreshControl(noticesQuery);
  const [notices, setNotices] = useState<RenderedNotice[]>();

  useEffect(() => {
    if (!noticesQuery.data) return;

    setNotices(
      noticesQuery.data.data.map(notice => {
        const { id, content, publishedAt } = notice;
        const dom = parseDocument(
          content.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
        ) as Document;
        const title = innerText(dom.children as any[]);
        return {
          id,
          publishedAt,
          title,
          contentString: content,
          content: (
            <HtmlView
              baseStyle={{
                paddingTop: 0,
                paddingHorizontal: spacing[5],
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
      style={GlobalStyles.grow}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      {notices &&
        (notices.length ? (
          <List dividers>
            {notices.map((notice, index) => {
              const linkCount =
                notice?.contentString?.toString().split(/<a\b[^>]*>/i).length -
                1;
              console.debug(linkCount);
              return (
                <Fragment key={notice.id}>
                  <ListItem
                    title={notice.title}
                    accessibilityLabel={`${DateTime.fromJSDate(
                      notice.publishedAt,
                    ).toFormat('dd/MM/yyyy')}, ${notice.title}. ${
                      linkCount > 0 && !notice.open
                        ? t('common.doubleClickToSeeLinks')
                        : ''
                    }`}
                    subtitle={formatDate(notice.publishedAt)}
                    onPress={() =>
                      setNotices(oldNotices =>
                        oldNotices.map((n, i) =>
                          i === index ? { ...n, open: !n.open } : n,
                        ),
                      )
                    }
                    trailingItem={
                      <Icon
                        icon={notice.open ? faChevronUp : faChevronDown}
                        color={colors.secondaryText}
                        size={fontSizes.lg}
                        style={{
                          marginLeft: spacing[2],
                          marginRight: -spacing[1],
                        }}
                      />
                    }
                  />
                  {notice.open && notice.content}
                </Fragment>
              );
            })}
          </List>
        ) : (
          <EmptyState
            icon={faInbox}
            message={t('courseNoticesTab.emptyState')}
          />
        ))}
    </ScrollView>
  );
};
