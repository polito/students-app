import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, SectionList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faChevronDown,
  faChevronRight,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { BookingSubtopic } from '@polito/api-client/models';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetBookingTopics } from '../../../core/queries/bookingHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type TopicSection = {
  title: string;
  topicId: string;
  topicTitle: string;
  isExpanded: boolean;
  index: number;
  data: BookingSubtopic[];
};

type Props = NativeStackScreenProps<ServiceStackParamList, 'BookingTopic'>;

export const BookingTopicScreen = ({ navigation }: Props) => {
  const topicsQuery = useGetBookingTopics();

  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();

  const [sections, setSections] = useState<TopicSection[]>([]);
  const { colors, fontWeights, spacing, shapes } = useTheme();

  useEffect(() => {
    if (topicsQuery.data) {
      setSections(
        topicsQuery?.data?.map((topic, index) => {
          return {
            title: topic.title,
            isExpanded: false,
            topicId: topic.id,
            topicTitle: topic.title,
            index: index,
            data: topic.subtopics,
          };
        }) || [],
      );
    }
  }, [topicsQuery?.data]);

  const toggleSection = (toggleIndex: number) => {
    setSections(oldSections =>
      oldSections.map((section, index) => ({
        ...section,
        isExpanded: index === toggleIndex ? !section.isExpanded : false,
      })),
    );
  };

  const onSelectTopic = useCallback(
    (topicId: string, topicTitle: string) => {
      navigation.navigate('BookingSlot', {
        topicId: topicId,
        topicName: topicTitle,
      });
    },
    [navigation],
  );

  return (
    <SafeAreaView>
      <OverviewList loading={topicsQuery.isLoading} indented>
        <SectionList
          refreshControl={<RefreshControl manual queries={[topicsQuery]} />}
          stickySectionHeadersEnabled
          sections={sections}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderSectionFooter={({ section: { index } }) =>
            index !== sections.length - 1 ? (
              <IndentedDivider indent={14} />
            ) : null
          }
          renderSectionHeader={({
            section: {
              title,
              topicTitle,
              topicId,
              index,
              isExpanded,
              data: subtopics,
            },
          }) => (
            <Pressable
              onPress={() => {
                subtopics?.length > 0
                  ? toggleSection(index)
                  : onSelectTopic(topicId, topicTitle);
              }}
              accessibilityLabel={[
                title,
                t(`common.openedStatus.${isExpanded}`),
                t(`common.openedStatusAction.${isExpanded}`),
              ].join(', ')}
            >
              <View
                style={{
                  paddingLeft: safeAreaInsets.left,
                  paddingRight: safeAreaInsets.right,
                  paddingVertical: spacing[3],
                  backgroundColor: colors.surface,
                }}
              >
                <SectionHeader
                  title={title}
                  titleStyle={{
                    fontWeight: fontWeights.medium,
                  }}
                  separator={false}
                  trailingItem={
                    subtopics?.length > 0 ? (
                      <Icon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        color={colors.secondaryText}
                      />
                    ) : (
                      <Icon
                        icon={faChevronRight}
                        color={colors.secondaryText}
                      />
                    )
                  }
                />
              </View>
            </Pressable>
          )}
          renderItem={({ section, item: subtopic, index }) => {
            const isFirstItem = index === 0;
            const isLastItem = index === section.data.length - 1;
            return section?.isExpanded ? (
              <Pressable
                onPress={() => onSelectTopic(subtopic.id, subtopic.title)}
              >
                <Row
                  justify="space-between"
                  align="center"
                  key={subtopic.id}
                  mh={4}
                  ph={3}
                  mb={isLastItem ? 2 : 0}
                  style={{
                    backgroundColor: colors.background,
                    paddingVertical: spacing[2.5],
                    borderTopLeftRadius: isFirstItem ? shapes.lg : 0,
                    borderTopRightRadius: isFirstItem ? shapes.lg : 0,
                    borderBottomRightRadius: isLastItem ? shapes.lg : 0,
                    borderBottomLeftRadius: isLastItem ? shapes.lg : 0,
                  }}
                >
                  <Text variant="prose">{subtopic.title}</Text>
                  <Icon icon={faChevronRight} color={colors.secondaryText} />
                </Row>
              </Pressable>
            ) : null;
          }}
        />
      </OverviewList>
    </SafeAreaView>
  );
};
