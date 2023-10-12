import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

interface Props {
  stepNumber: number;
  width: number;
}
export const OnboardingStep = ({ stepNumber, width }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  return (
    <SafeAreaView
      style={{
        backgroundColor: 'blue',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Col gap={8} style={{ width, backgroundColor: 'yellow' }} align="center">
        <Col mt={5} gap={1} style={styles.header}>
          <Text variant="title" role="heading">
            {t(`onboardingScreen.steps.${stepNumber}.title`)}
          </Text>
          <Text variant="prose" role="definition">
            {t(`onboardingScreen.steps.${stepNumber}.content`)}
          </Text>
        </Col>
        <Row style={[styles.video, { flexBasis: 'auto' }]}>
          <Video
            source={{
              uri: 'https://video.polito.it/public/app/onboarding_step_1_android_it.mp4',
            }}
            style={{ height: '100%', aspectRatio: 9 / 16 }}
            resizeMode="contain"
          />
        </Row>
      </Col>
    </SafeAreaView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    video: {
      backgroundColor: '#D9D9D9',
    },
    header: {},
  });
