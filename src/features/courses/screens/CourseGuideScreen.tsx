import { useMemo } from 'react';
import { Platform, SafeAreaView, ScrollView } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { GuideSection } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetCourseGuide } from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseGuide'>;

export const CourseGuideScreen = ({ route }: Props) => {
  const { courseId } = route.params;
  const { spacing } = useTheme();
  const guideQuery = useGetCourseGuide(courseId);
  const guideSections = useMemo(() => {
    const sections: GuideSection[] = [];

    guideQuery.data?.forEach(section => {
      const content = section.content.replace(/[\f\n]+/g, '\n').trim();

      // Remove empty sections
      if (content) sections.push({ ...section, content });
    });

    return sections;
  }, [guideQuery]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingVertical: spacing[5] }}
      refreshControl={<RefreshControl queries={[guideQuery]} />}
    >
      <SafeAreaView>
        <Section>
          <Card
            padded
            gapped
            style={{
              marginVertical: spacing[2],
              marginHorizontal: Platform.select({ ios: spacing[4] }),
            }}
          >
            {guideSections.map((section, i) => (
              <Col key={`section.title_${i}`}>
                <Text
                  accessible={false}
                  variant="subHeading"
                  accessibilityRole="header"
                >
                  {section.title}
                </Text>
                <Text variant="longProse">{section.content}</Text>
              </Col>
            ))}
          </Card>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
