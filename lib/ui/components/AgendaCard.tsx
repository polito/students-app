import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableHighlight, View } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { AgendaItemInterface } from '../../../src/utils/types';
import { useTheme } from '../hooks/useTheme';
import { Card, Props as CardProps } from './Card';
import { LiveIndicator } from './LiveIndicator';
import { Text } from './Text';

interface Props {
  item: AgendaItemInterface;
}

export const AgendaCard = ({
  item,
  ...rest
}: PropsWithChildren<CardProps & Props>) => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const live = true;
  const borderColor = colors.primary[500];
  const fromHour = DateTime.fromISO(item.fromDate).toFormat('HH:mm');
  const toHour = DateTime.fromISO(item.toDate).toFormat('HH:mm');
  const time = `${fromHour} - ${toHour}`;

  const onPressCard = (): void => {
    console.log('item', item);
    navigation.navigate({
      name: item.type,
      params: {
        id: item.content.id,
      },
    });
  };

  return (
    <Card style={[{ borderColor }, styles.agendaCard]} {...rest}>
      <TouchableHighlight
        style={styles.agendaButtonStyle}
        onPress={onPressCard}
      >
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

const createStyles = ({ spacing, colors, size, fontSizes }: Theme) =>
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
      color: colors.title,
      fontSize: fontSizes.lg,
    },
    agendaCard: {
      flex: 1,
      width: '100%',
      borderWidth: 3,
      marginTop: spacing['2'],
    },
    agendaButtonStyle: {
      padding: spacing[4],
      paddingBottom: spacing[3],
    },
  });
