import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faCouch } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';

import { EmptyCard } from './EmptyCard';

export const EmptyWeek = () => {
  const { t } = useTranslation();

  return (
    <Row>
      <Col noFlex style={styles.dayColumn}></Col>
      <Col style={styles.itemsColumn}>
        <EmptyCard icon={faCouch} message={t('agendaScreen.emptyWeek')} />
      </Col>
    </Row>
  );
};

const styles = StyleSheet.create({
  dayColumn: {
    width: '15%',
    maxWidth: 200,
  },
  itemsColumn: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
