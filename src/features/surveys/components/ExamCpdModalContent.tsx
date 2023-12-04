import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ModalContent } from '@lib/ui/components/ModalContent';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { Survey } from '@polito/api-client';

import { SurveyListItem } from './SurveyListItem';

type Props = {
  surveys: Survey[];
  close: () => void;
};

export const ExamCpdModalContent = ({ surveys, close }: Props) => {
  const { t } = useTranslation();

  const styles = useStylesheet(createStyles);
  return (
    <ModalContent title={t('examCpdModalContent.title')} close={close}>
      <Col pv={4} ph={4} gap={4}>
        <Col align="center">
          <Icon
            icon={faWarning}
            color={styles.icon.color}
            size={styles.icon.size}
          />
        </Col>
        <Text variant="prose" style={styles.message}>
          {t('examCpdModalContent.message')}
        </Text>
        <OverviewList indented>
          {surveys.map(survey => (
            <SurveyListItem key={survey.id} survey={survey} />
          ))}
        </OverviewList>
      </Col>
    </ModalContent>
  );
};

const createStyles = ({ fontSizes, palettes, dark }: Theme) =>
  StyleSheet.create({
    icon: {
      size: fontSizes['5xl'],
      color: dark ? palettes.danger[200] : palettes.danger[800],
    },
    message: {
      color: dark ? palettes.danger[200] : palettes.danger[800],
    },
  });
