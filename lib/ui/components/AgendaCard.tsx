import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableHighlight, View } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { DateTime } from 'luxon';

import { AgendaItem } from '../../../src/utils/types';
import { useTheme } from '../hooks/useTheme';
import { Card, Props as CardProps } from './Card';
import { LiveIndicator } from './LiveIndicator';
import { Text } from './Text';

interface Props {
  item: AgendaItem;
}

export const AgendaCard = ({
  item,
  ...rest
}: PropsWithChildren<CardProps & Props>) => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const live = true;
  const borderColor = colors.primary[500];
  const fromHour = DateTime.fromISO(item.fromDate).toFormat('HH:mm');
  const toHour = DateTime.fromISO(item.toDate).toFormat('HH:mm');
  const time = `${fromHour} - ${toHour}`;

  return (
    <Card style={[{ borderColor }, styles.agendaCard]} {...rest}>
      <TouchableHighlight style={styles.agendaButtonStyle}>
        <Col>
          <Row justifyCenter alignCenter spaceBetween noFlex maxWidth>
            <Text
              weight={'bold'}
              numberOfLines={1}
              variant={'secondaryText'}
              style={styles.title}
            >
              {item.title}
            </Text>
            <Row noFlex justifyCenter alignCenter>
              {live && <LiveIndicator />}
              <Text variant="secondaryText" style={{ fontSize: fontSizes.xs }}>
                {time}
              </Text>
            </Row>
          </Row>
          <Row
            justifyCenter
            alignCenter
            spaceBetween
            noFlex
            maxWidth
            style={styles.rowBottom}
          >
            <View style={styles.itemType}>
              <Text style={styles.textType} variant={'prose'}>
                {t(item.type)}
              </Text>
            </View>
            <Text weight={'medium'}>{item.classroom}</Text>
          </Row>
        </Col>
      </TouchableHighlight>
    </Card>
  );
};

const createStyles = ({ spacing, colors, size }: Theme) =>
  StyleSheet.create({
    rowBottom: {
      marginTop: size.sm,
    },
    itemType: {
      borderRadius: size.xs,
      paddingVertical: spacing['1'],
      paddingHorizontal: spacing[1.5],
      borderColor: colors.primary[600],
      borderWidth: 1,
    },
    textType: {
      fontSize: 12,
    },
    title: {
      maxWidth: '50%',
      color: colors.trueGray[700],
    },
    agendaCard: {
      flex: 1,
      width: '100%',
      borderWidth: 2,
      marginTop: spacing['1.5'],
    },
    agendaButtonStyle: {
      padding: spacing[5],
    },
  });
