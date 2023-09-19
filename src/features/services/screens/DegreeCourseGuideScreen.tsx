import { Platform, SafeAreaView, ScrollView } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { HtmlView } from '../../../core/components/HtmlView';
import { useGetOfferingCourse } from '../../../core/queries/offeringHooks';
import { sanitizeHtml } from '../../../utils/html';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'DegreeCourseGuide'>;
export const DegreeCourseGuideScreen = ({ route }: Props) => {
  const { courseShortcode, year } = route.params;
  const courseQuery = useGetOfferingCourse({ courseShortcode, year });
  const { spacing } = useTheme();
  const offeringCourse = courseQuery.data;

  return (
    <ScrollView
      refreshControl={<RefreshControl queries={[courseQuery]} manual />}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ marginTop: spacing[1] }}
    >
      <SafeAreaView>
        <Card
          style={{
            marginVertical: spacing[2],
            marginHorizontal: Platform.select({ ios: spacing[4] }),
            paddingHorizontal: spacing[5],
            paddingBottom: spacing[4],
            paddingTop: spacing[2],
          }}
        >
          {offeringCourse?.guide.map((section, i) => (
            <Col
              justify="flex-start"
              key={i}
              style={{ paddingBottom: spacing[2] }}
            >
              <Text variant="subHeading" accessibilityRole="header">
                {section.title}
              </Text>
              <HtmlView
                source={{ html: sanitizeHtml(section.content) }}
                baseStyle={{ padding: 0 }}
              />
            </Col>
          ))}
        </Card>
      </SafeAreaView>
      <BottomBarSpacer />
    </ScrollView>
  );
};
