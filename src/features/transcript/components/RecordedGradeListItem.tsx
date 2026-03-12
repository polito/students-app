import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { ExamGrade } from '@polito/api-client';

import { formatDate } from '../../../utils/dates';
import { formatGrade } from '../../../utils/grades';

type RecordedGradeProps = {
  grade: ExamGrade;
};

export const RecordedGradeListItem = ({ grade }: RecordedGradeProps) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  return (
    <ListItem
      key={grade.courseName}
      title={grade.courseName}
      subtitle={`${formatDate(grade.date)} - ${t('common.creditsWithUnit', {
        credits: grade.credits,
      })}`}
      trailingItem={
        <Row align="center" pl={2}>
          <Text
            variant="title"
            style={styles.grade}
            accessibilityLabel={`${t('common.grade')}: ${grade?.grade}`}
          >
            {t(formatGrade(grade.grade))}
          </Text>
          <DisclosureIndicator />
        </Row>
      }
      linkTo={{
        screen: 'RecordedGrade',
        params: {
          grade: {
            ...grade,
            date: grade.date.toISOString(),
          },
        },
      }}
    />
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    grade: {
      marginLeft: spacing[2],
    },
  });
