import { StyleSheet } from 'react-native';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Message } from '@polito/api-client';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { formatDateTime } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';

interface Props {
  messageItem: Message;
  index: number;
  totalData: number;
}

export const MessageListItem = ({ messageItem, index, totalData }: Props) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { accessibilityListLabel } = useAccessibility();

  const accessibilityLabel = accessibilityListLabel(index, totalData);
  const title = getHtmlTextContent(messageItem?.title);
  const sentAt = formatDateTime(messageItem.sentAt);

  return (
    <ListItem
      unread={messageItem.isRead}
      title={title}
      titleStyle={styles.title}
      // linkTo={{
      //   screen: 'NewsItem',
      //   params: {
      //     id: newsItem?.id,
      //   },
      // }}
      accessibilityLabel={[accessibilityLabel, title, sentAt].join(', ')}
      subtitle={sentAt}
      subtitleStyle={styles.subtitle}
      trailingItem={
        <Icon
          icon={faChevronRight}
          color={colors.secondaryText}
          style={styles.icon}
        />
      }
    />
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights, palettes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
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
