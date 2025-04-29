import { Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { HtmlView } from '../../../core/components/HtmlView';
import { useGetOfferingCourse } from '../../../core/queries/offeringHooks';
import { sanitizeHtml } from '../../../utils/html';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'DegreeCourseGuide'>;
export const DegreeCourseGuideScreen = ({ route }: Props) => {
  const { courseShortcode, year } = route.params;
  const courseQuery = useGetOfferingCourse({ courseShortcode, year });
  const offeringCourse = courseQuery.data;

  const styles = useStylesheet(createStyles);
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl queries={[courseQuery]} manual />}
    >
      <SafeAreaView>
        <Section>
          <Card padded gapped style={styles.card}>
            {offeringCourse?.guide.map((section, i) => (
              <Col key={i}>
                <Text variant="subHeading" accessibilityRole="header">
                  {section.title}
                </Text>
                <HtmlView
                  props={{
                    source: { html: sanitizeHtml(section.content) },
                    baseStyle: styles.html,
                  }}
                  variant="longProse"
                />
              </Col>
            ))}
          </Card>
        </Section>
      </SafeAreaView>
      <BottomBarSpacer />
    </ScrollView>
  );
};

const createStyles = ({ fontSizes, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    card: {
      marginVertical: spacing[2],
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    html: {
      lineHeight: fontSizes.sm * 1.5,
      padding: 0,
    },
  });
