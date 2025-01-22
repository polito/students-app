import { StyleSheet, View } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { VerticalDashedLine } from '@lib/ui/components/VerticalDashedLine';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { ProvisionalGradeStateEnum } from '@polito/api-client/models/ProvisionalGrade';
import { ProvisionalGradeState } from '@polito/api-client/models/ProvisionalGradeState';

import { useGetProvisionalGradeStates } from '../../../core/queries/studentHooks';

type RowProps = {
  state: ProvisionalGradeState;
  isActive?: boolean;
};

const GradeStateRow = ({ state, isActive = false }: RowProps) => {
  const styles = useStylesheet(createStyles);
  return (
    <Row ph={5} gap={5}>
      <Col pt={9}>
        <View
          style={[
            styles.dot,
            !isActive && styles.dotInactive,
            isActive &&
              state.id === ProvisionalGradeStateEnum.Published &&
              styles.dotPublished,
            isActive &&
              state.id === ProvisionalGradeStateEnum.Confirmed &&
              styles.dotConfirmed,
          ]}
        ></View>
      </Col>
      <Col pt={5} flexShrink={1}>
        <Text
          style={[styles.stateTitle, !isActive && styles.stateTitleInactive]}
        >
          {state.name}
        </Text>
        <Text
          style={[
            styles.stateDescription,
            !isActive && styles.stateDescriptionInactive,
          ]}
        >
          {state.description}
        </Text>
      </Col>
    </Row>
  );
};

type Props = {
  state: ProvisionalGradeStateEnum;
};

export const GradeStates = ({ state }: Props) => {
  const styles = useStylesheet(createStyles);
  const { data: gradeStates } = useGetProvisionalGradeStates();

  return (
    <Card>
      <VerticalDashedLine
        height="100%"
        width="4"
        color={styles.dashedLine.borderColor}
        style={styles.dashedLine}
      />
      <View style={styles.dashedLine} />
      <Col pb={5}>
        {gradeStates?.map((gradeState, index) => (
          <GradeStateRow
            key={index}
            state={gradeState}
            isActive={gradeState.id === state}
          />
        ))}
      </Col>
    </Card>
  );
};

const createStyles = ({
  colors,
  dark,
  fontSizes,
  fontWeights,
  palettes,
}: Theme) =>
  StyleSheet.create({
    dashedLine: {
      position: 'absolute',
      top: 0,
      left: 26,
      borderColor: palettes.gray[dark ? 500 : 200],
    },
    dot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
    },
    dotPublished: {
      borderColor: palettes.warning[dark ? 400 : 600],
      backgroundColor: palettes.warning[dark ? 700 : 300],
    },
    dotConfirmed: {
      borderColor: palettes.primary[dark ? 300 : 400],
      backgroundColor: palettes.primary[dark ? 500 : 200],
    },
    dotInactive: {
      borderColor: palettes.gray[dark ? 500 : 400],
      backgroundColor: dark ? colors.background : palettes.gray[100],
    },
    stateTitle: {
      fontSize: fontSizes.md,
      lineHeight: fontSizes.md * 1.5,
      fontWeight: fontWeights.medium,
    },
    stateTitleInactive: {
      color: colors.caption,
    },
    stateDescription: {
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.sm * 1.5,
      color: colors.secondaryText,
    },
    stateDescriptionInactive: {
      color: colors.caption,
    },
  });
