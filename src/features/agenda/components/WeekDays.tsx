import { PropsWithChildren } from 'react';
import { StyleSheet, ViewProps } from 'react-native';

import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { weekDays } from '../../../utils';

export type Props = PropsWithChildren<ViewProps>;

export const WeekDays = ({ style }: Props) => {
  const styles = useStylesheet(createStyles);

  return (
    <Row noFlex maxWidth spaceAround style={style}>
      {weekDays().map(week => {
        return (
          <Text key={week} style={styles.textDay} capitalize>
            {week}
          </Text>
        );
      })}
    </Row>
  );
};

const createStyles = ({ colors, fontWeights, dark }: Theme) =>
  StyleSheet.create({
    textDay: {
      color: dark ? colors.primary[100] : colors.text[600],
      minWidth: 30,
      fontSize: 14,
      textAlign: 'center',
      fontWeight: fontWeights.semibold,
      flex: 1,
    },
  });
