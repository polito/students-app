/* eslint-disable react-native/no-color-literals */
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Col } from '@lib/ui/components/Col';
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
    <Col gap={5} style={{ width }}>
      <Col mh={5} mt={5} gap={1} style={styles.header}>
        <Text variant="title" role="heading">
          {stepNumber} -{t('onboardingScreen.titleFase1')}
        </Text>
        <Text variant="prose" role="definition">
          {t('onboardingScreen.contentFase1')}
        </Text>
      </Col>
      <Col style={styles.video} />
    </Col>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    video: {
      display: 'flex',
      marginHorizontal: spacing[5],
      height: 600,
      backgroundColor: '#D9D9D9',
    },
    header: {
      height: 130,
    },
  });
