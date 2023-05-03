import { useMemo } from 'react';
import { Platform, ScrollView } from 'react-native';

import { CourseGuideSection } from '@polito/api-client/models/CourseGuideSection';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetCourseGuide } from '@core/queries/courses';

import { Card } from '@lib/ui/components/Card';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { CoursesStackParamList } from './createCoursesScreens';

type Props = NativeStackScreenProps<CoursesStackParamList, 'Guide'>;

export const Guide = ({ route }: Props) => {
  const { courseId } = route.params;
  const { spacing } = useTheme();
  const guideQuery = useGetCourseGuide(courseId);
  const guideSections = useMemo(() => {
    const sections: CourseGuideSection[] = [];

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
      contentContainerStyle={{ paddingTop: spacing[6] }}
      refreshControl={<RefreshControl queries={[guideQuery]} />}
    >
      {guideSections.map((section, i) => (
        <Section key={i}>
          <SectionHeader title={section.title} />
          <Card
            style={{
              marginVertical: spacing[2],
              marginHorizontal: Platform.select({ ios: spacing[4] }),
              paddingHorizontal: spacing[5],
              paddingVertical: spacing[5],
            }}
          >
            <Text>{section.content}</Text>
          </Card>
        </Section>
      ))}
    </ScrollView>
  );
};
