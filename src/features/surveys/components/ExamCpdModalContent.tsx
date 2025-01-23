import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { ModalContent } from '@lib/ui/components/ModalContent';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Survey } from '@polito/api-client';

import { SurveyListItemByTypeName } from './SurveyListItemByTypeName';

type Props = {
  surveys: Survey[];
  close: () => void;
};

export const ExamCpdModalContent = ({ surveys, close }: Props) => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();

  const styles = useStylesheet(createStyles);
  return (
    <ModalContent title={t('examCpdModalContent.title')} close={close}>
      <Col pt={4} pb={8} ph={4} gap={2}>
        <Col align="center" gap={4}>
          <Icon
            icon={faWarning}
            color={styles.icon.color}
            size={fontSizes['5xl']}
          />
          <Text variant="prose" style={styles.message}>
            {t('examCpdModalContent.message')}
          </Text>
        </Col>

        <OverviewList>
          {surveys.map(survey => (
            <SurveyListItemByTypeName
              key={survey.id}
              survey={survey}
              trailingItem={<DisclosureIndicator />}
            />
          ))}
        </OverviewList>
      </Col>
    </ModalContent>
  );
};

const createStyles = ({ palettes, dark }: Theme) =>
  StyleSheet.create({
    icon: {
      color: dark ? palettes.danger[200] : palettes.danger[800],
    },
    message: {
      color: dark ? palettes.danger[200] : palettes.danger[800],
    },
  });
