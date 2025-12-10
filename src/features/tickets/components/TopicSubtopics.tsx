import { StyleSheet, View } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

type Subtopic = {
  id: string;
  title: string;
};

type Topic = {
  id: string;
  title: string;
  subtopics: Subtopic[];
};

interface TopicSubtopicsProps {
  topic: Topic;
  onSubtopicPress: (topic: Topic, subtopic: Subtopic) => void;
}

export const TopicSubtopics = ({
  topic,
  onSubtopicPress,
}: TopicSubtopicsProps) => {
  const styles = useStylesheet(createStyles);

  return (
    <View style={styles.topicSectionContainer}>
      <OverviewList
        rounded={true}
        dividers={true}
        style={styles.firstLevelOverviewList}
      >
        {topic.subtopics.map(subtopic => (
          <ListItem
            key={subtopic.id}
            title={subtopic.title}
            titleProps={{ numberOfLines: undefined }}
            style={styles.listItem}
            containerStyle={styles.listItemContainer}
            onPress={() => onSubtopicPress(topic, subtopic)}
            accessibilityRole="button"
          />
        ))}
      </OverviewList>
    </View>
  );
};

const createStyles = ({ spacing, colors, palettes, dark }: Theme) =>
  StyleSheet.create({
    firstLevelOverviewList: {
      marginHorizontal: spacing[4],
      elevation: 0,
    },
    topicSectionContainer: {
      marginTop: spacing[2],
    },
    listItem: {
      backgroundColor: dark ? colors.surfaceDark : palettes.gray['100'],
    },
    listItemContainer: {
      minHeight: 45,
    },
  });
