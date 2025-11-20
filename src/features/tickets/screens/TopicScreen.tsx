import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { NestedList, NestedListSection } from '@lib/ui/components/NestedList';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

type Subtopic = {
  id: string;
  title: string;
};

type Topic = {
  id: string;
  title: string;
  subtopics: Subtopic[];
};

type RouteParams = {
  topics?: Topic[];
  onSelect?: (selection: { topic: Topic; subtopic: Subtopic }) => void;
  returnScreen?: string;
};

type Props = {
  navigation: NavigationProp<Record<string, object | undefined>, string>;
  route: RouteProp<Record<string, RouteParams | undefined>, string>;
};

export default function TopicScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | undefined>();

  const defaultTopics: Topic[] = [
    {
      id: 't1',
      title: 'Account',
      subtopics: [
        { id: 's1', title: 'Password reset' },
        { id: 's2', title: 'Change email' },
      ],
    },
    {
      id: 't2',
      title: 'Billing',
      subtopics: [
        { id: 's3', title: 'Invoice request' },
        { id: 's4', title: 'Payment failed' },
      ],
    },
    {
      id: 't3',
      title: 'Technical',
      subtopics: [
        { id: 's5', title: 'Bug report' },
        { id: 's6', title: 'Performance' },
      ],
    },
  ];

  const topics: Topic[] = route.params?.topics ?? defaultTopics;
  const onSelect = route.params?.onSelect;
  const returnScreen = route.params?.returnScreen;

  const sections: NestedListSection<Subtopic, Topic>[] = topics.map(
    (topic, index) => ({
      title: topic.title,
      isExpanded: expandedIndex === index,
      index,
      data: topic.subtopics,
      sectionData: topic,
    }),
  );

  const toggleSection = (index: number) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? undefined : index));
  };

  const handleSubtopicPress = (topic: Topic, subtopic: Subtopic) => {
    try {
      if (onSelect) {
        onSelect({ topic, subtopic });
        navigation.goBack();
        return;
      }

      if (returnScreen) {
        navigation.navigate(returnScreen as any, {
          selectedTopic: { id: topic.id, title: topic.title },
          selectedSubtopic: { id: subtopic.id, title: subtopic.title },
        });
        return;
      }

      navigation.goBack();
    } catch (err) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NestedList
        sections={sections}
        loading={false}
        queries={[]}
        onToggleSection={toggleSection}
        renderSectionHeader={({ section }) => (
          <Pressable
            onPress={() => toggleSection(section.index)}
            style={styles.sectionHeaderContainer}
          >
            <SectionHeader
              title={section.title}
              separator={false}
              trailingItem={
                <Icon
                  icon={section.isExpanded ? faChevronUp : faChevronDown}
                  color={colors.secondaryText}
                />
              }
            />
          </Pressable>
        )}
        renderItem={({ item, section }) =>
          section.isExpanded ? (
            <ListItem
              key={item.id}
              title={item.title}
              onPress={() => handleSubtopicPress(section.sectionData!, item)}
              accessibilityRole="button"
            />
          ) : null
        }
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  sectionHeaderContainer: {
    paddingVertical: 12,
  },
});
