import { StyleSheet } from 'react-native';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NewsItemOverview } from '@polito/api-client';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { formatDate } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';

interface Props {
  newsItem: NewsItemOverview;
  index: number;
  totalData: number;
}

export const NewsListItem = ({ newsItem, index, totalData }: Props) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { accessibilityListLabel } = useAccessibility();
  const { getUnreadsCount } = useNotifications();

  const accessibilityLabel = accessibilityListLabel(index, totalData);
  const title = getHtmlTextContent(newsItem?.title);
  const shortDescription = getHtmlTextContent(newsItem?.shortDescription);
  const createdAt = formatDate(newsItem.createdAt);
  const subTitle = `${createdAt} - ${shortDescription}`;

  return (
    <ListItem
      title={title}
      titleStyle={styles.title}
      linkTo={{
        screen: 'NewsItem',
        params: {
          id: newsItem?.id,
        },
      }}
      accessibilityRole="button"
      accessibilityLabel={[accessibilityLabel, title, subTitle].join(', ')}
      subtitle={subTitle}
      subtitleStyle={styles.subtitle}
      trailingItem={
        <Icon
          icon={faChevronRight}
          color={colors.secondaryText}
          style={styles.icon}
        />
      }
      unread={!!getUnreadsCount(['services', 'news', newsItem?.id.toString()])}
    />
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights, palettes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    subtitle: {
      color: palettes.text['500'],
      fontWeight: fontWeights.normal,
      fontSize: fontSizes.sm,
      marginTop: spacing[0.5],
    },
    icon: {
      marginRight: -spacing[1],
    },
  });
