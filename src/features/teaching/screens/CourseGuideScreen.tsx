import { useMemo } from 'react';
import { Platform, RefreshControl, ScrollView } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseGuideSection } from '@polito/api-client/models/CourseGuideSection';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourseGuide } from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseGuide'>;

export const CourseGuideScreen = ({ route }: Props) => {
  const { courseId } = route.params;
  const { spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const guideQuery = useGetCourseGuide(courseId);
  const refreshControl = useRefreshControl(guideQuery);
  const guideSections = useMemo(() => {
    const sections: CourseGuideSection[] = [];

    guideQuery.data?.data?.forEach(section => {
      const content = section.content.replace(/[\f\n]+/g, '\n').trim();

      // Remove empty sections
      if (content) sections.push({ ...section, content });
    });

    return sections;
  }, [guideQuery]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[bottomBarAwareStyles, { paddingTop: spacing[6] }]}
      refreshControl={<RefreshControl {...refreshControl} />}
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
