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
  {
    id: 't4',
    title: 'Enrollment',
    subtopics: [
      { id: 's7', title: 'Course registration' },
      { id: 's8', title: 'Drop course' },
    ],
  },
  {
    id: 't5',
    title: 'Grades',
    subtopics: [
      { id: 's9', title: 'Grade appeal' },
      { id: 's10', title: 'Missing grade' },
    ],
  },
  {
    id: 't6',
    title: 'Transcripts',
    subtopics: [
      { id: 's11', title: 'Request transcript' },
      { id: 's12', title: 'Transcript error' },
    ],
  },
  {
    id: 't7',
    title: 'Library',
    subtopics: [
      { id: 's13', title: 'Book loan' },
      { id: 's14', title: 'Library fine' },
    ],
  },
  {
    id: 't8',
    title: 'Campus Facilities',
    subtopics: [
      { id: 's15', title: 'Lost item' },
      { id: 's16', title: 'Maintenance request' },
    ],
  },
  {
    id: 't9',
    title: 'IT Support',
    subtopics: [
      { id: 's17', title: 'WiFi issue' },
      { id: 's18', title: 'Software installation' },
    ],
  },
  {
    id: 't10',
    title: 'Student Life',
    subtopics: [
      { id: 's19', title: 'Event info' },
      { id: 's20', title: 'Club registration' },
    ],
  },
  {
    id: 't11',
    title: 'Housing',
    subtopics: [
      { id: 's21', title: 'Room change' },
      { id: 's22', title: 'Maintenance' },
    ],
  },
  {
    id: 't12',
    title: 'Dining',
    subtopics: [
      { id: 's23', title: 'Meal plan' },
      { id: 's24', title: 'Dietary request' },
    ],
  },
  {
    id: 't13',
    title: 'Parking',
    subtopics: [
      { id: 's25', title: 'Permit issue' },
      { id: 's26', title: 'Parking fine' },
    ],
  },
  {
    id: 't14',
    title: 'Health',
    subtopics: [
      { id: 's27', title: 'Medical appointment' },
      { id: 's28', title: 'Insurance' },
    ],
  },
  {
    id: 't15',
    title: 'Financial Aid',
    subtopics: [
      { id: 's29', title: 'Scholarship info' },
      { id: 's30', title: 'Grant application' },
    ],
  },
  {
    id: 't16',
    title: 'International',
    subtopics: [
      { id: 's31', title: 'Visa support' },
      { id: 's32', title: 'Language courses' },
    ],
  },
  {
    id: 't17',
    title: 'Career',
    subtopics: [
      { id: 's33', title: 'Internship' },
      { id: 's34', title: 'Job fair' },
    ],
  },
  {
    id: 't18',
    title: 'Research',
    subtopics: [
      { id: 's35', title: 'Lab access' },
      { id: 's36', title: 'Funding' },
    ],
  },
  {
    id: 't19',
    title: 'Alumni',
    subtopics: [
      { id: 's37', title: 'Transcript request' },
      { id: 's38', title: 'Alumni events' },
    ],
  },
  {
    id: 't20',
    title: 'General Inquiry',
    subtopics: [
      { id: 's39', title: 'Contact info' },
      { id: 's40', title: 'Other' },
    ],
  },
  {
    id: 't21',
    title: 'Sports',
    subtopics: [
      { id: 's41', title: 'Team registration' },
      { id: 's42', title: 'Facility booking' },
    ],
  },
  {
    id: 't22',
    title: 'Safety',
    subtopics: [
      { id: 's43', title: 'Report incident' },
      { id: 's44', title: 'Emergency info' },
    ],
  },
  {
    id: 't23',
    title: 'Accessibility',
    subtopics: [
      { id: 's45', title: 'Request accommodation' },
      { id: 's46', title: 'Campus access' },
    ],
  },
  {
    id: 't24',
    title: 'Transportation',
    subtopics: [
      { id: 's47', title: 'Bus pass' },
      { id: 's48', title: 'Shuttle schedule' },
    ],
  },
  {
    id: 't25',
    title: 'Feedback',
    subtopics: [
      { id: 's49', title: 'App feedback' },
      { id: 's50', title: 'Service feedback' },
    ],
  },
];

export default function TopicScreen({ navigation, route }: Props) {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const safeAreaInsets = useSafeAreaInsets();
  const styles = useStylesheet(createStyles);
  const { colors, spacing } = useTheme();
  const [sections, setSections] = useState<TopicSection[]>([]);

  const topics = useMemo(() => {
    return route.params?.topics ?? defaultTopics;
  }, [route.params?.topics]);

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
      loading={false}
      queries={[]}
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
