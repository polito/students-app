import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { NestedList, NestedListSection } from '@lib/ui/components/NestedList';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

import { useGetTicketTopics } from '../../../core/queries/ticketHooks';
import { TopicSubtopics } from '../components/TopicSubtopics';

type Subtopic = {
  id: string;
  title: string;
};

type Topic = {
  id: string;
  title: string;
  subtopics: Subtopic[];
};

type TopicSection = NestedListSection<Topic, Topic>;

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
  const bottomTabBarHeight = useBottomTabBarHeight();
  const safeAreaInsets = useSafeAreaInsets();
  const styles = useStylesheet(createStyles);
  const { colors, spacing } = useTheme();
  const [sections, setSections] = useState<TopicSection[]>([]);

  // Fetch topics from API instead of using hardcoded data
  const topicsQuery = useGetTicketTopics();

  const topics = useMemo(() => {
    if (route.params?.topics) {
      return route.params.topics;
    }
    // Convert API response to match expected Topic interface
    return (
      topicsQuery.data?.map(topic => ({
        id: topic.id.toString(),
        title: topic.name,
        subtopics:
          topic.subtopics?.map(subtopic => ({
            id: subtopic.id.toString(),
            title: subtopic.name,
          })) ?? [],
      })) ?? []
    );
  }, [route.params?.topics, topicsQuery.data]);

  const onSelect = route.params?.onSelect;
  const returnScreen = route.params?.returnScreen;

  useEffect(() => {
    setSections(
      topics.map((topic, index) => ({
        title: topic.title,
        isExpanded: false,
        index,
        data: [topic],
        sectionData: topic,
      })),
    );
  }, [topics]);

  const toggleSection = (toggleIndex: number) => {
    setSections(oldSections =>
      oldSections.map((section, index) => ({
        ...section,
        isExpanded:
          index === toggleIndex ? !section.isExpanded : section.isExpanded,
      })),
    );
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

  const renderSectionHeader = ({ section }: { section: TopicSection }) => (
    <Pressable
      onPress={() => toggleSection(section.index)}
      style={styles.sectionHeaderContainer}
    >
      <View
        style={{
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
          ...styles.sectionHeader,
        }}
      >
        <SectionHeader
          title={section.title}
          separator={false}
          titleStyle={styles.sectionHeaderTitle}
          trailingItem={
            <Icon
              icon={section.isExpanded ? faChevronUp : faChevronDown}
              color={colors.secondaryText}
            />
          }
        />
      </View>
    </Pressable>
  );

  const renderItem = ({
    item,
    section,
  }: {
    item: Topic;
    section: TopicSection;
  }) =>
    section.isExpanded ? (
      <TopicSubtopics topic={item} onSubtopicPress={handleSubtopicPress} />
    ) : null;

  return (
    <NestedList
      sections={sections}
      loading={topicsQuery.isLoading}
      queries={[topicsQuery]}
      onToggleSection={toggleSection}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      style={{
        marginTop: spacing[4],
        marginBottom: bottomTabBarHeight + spacing[2],
      }}
      indented={true}
    />
  );
}

const createStyles = ({
  spacing,
  colors,
  palettes,
  dark,
  fontWeights,
  shapes,
}: Theme) =>
  StyleSheet.create({
    sectionHeader: {
      paddingVertical: spacing[3],
      backgroundColor: dark ? colors.surface : colors.surface,
      marginHorizontal: spacing[4],
      borderRadius: shapes.lg,
      marginVertical: spacing[1],
    },
    sectionHeaderContainer: {
      // Remove previous container styles as they're now handled in sectionHeader
    },
    sectionHeaderTitle: {
      color: dark ? palettes.info['400'] : palettes.info['700'],
      textTransform: 'none',
      fontWeight: fontWeights.medium,
    },
  });
