import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { VerticalDashedLine } from '@lib/ui/components/VerticalDashedLine';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { ProvisionalGradeStateEnum } from '@polito/api-client/models/ProvisionalGrade';

type RowProps = {
  state: ProvisionalGradeStateEnum | 'pending';
  isActive?: boolean;
};

const GradeStateRow = ({ state, isActive = false }: RowProps) => {
  const { t } = useTranslation();

  const styles = useStylesheet(createStyles);
  return (
    <Row ph={5} gap={5}>
      <Col pt={9}>
        <View
          style={[
            styles.dot,
            !isActive && styles.dotInactive,
            isActive &&
              state === ProvisionalGradeStateEnum.Published &&
              styles.dotPublished,
            isActive &&
              state === ProvisionalGradeStateEnum.Confirmed &&
              styles.dotConfirmed,
          ]}
        ></View>
      </Col>
      <Col pt={5} flexShrink={1}>
        <Text
          style={[styles.stateTitle, !isActive && styles.stateTitleInactive]}
        >
          {t(`provisionalGradeScreen.${state}State`)}
        </Text>
        <Text
          style={[
            styles.stateDescription,
            !isActive && styles.stateDescriptionInactive,
          ]}
        >
          {t(`provisionalGradeScreen.${state}StateDescription`)}
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
        <GradeStateRow state="pending" />
        <GradeStateRow
          state={ProvisionalGradeStateEnum.Published}
          isActive={state === ProvisionalGradeStateEnum.Published}
        />
        <GradeStateRow
          state={ProvisionalGradeStateEnum.Confirmed}
          isActive={state === ProvisionalGradeStateEnum.Confirmed}
        />
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
      borderColor: palettes.gray[dark ? 800 : 200],
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
      borderColor: palettes.primary[dark ? 600 : 400],
      backgroundColor: palettes.primary[dark ? 800 : 200],
    },
    dotInactive: {
      borderColor: palettes.gray[dark ? 600 : 400],
      backgroundColor: palettes.gray[dark ? 900 : 100],
    },
    stateTitle: {
      fontSize: fontSizes.md,
      lineHeight: fontSizes.md * 1.5,
      fontWeight: fontWeights.medium,
    },
    stateTitleInactive: {
      color: palettes.text[dark ? 600 : 400],
    },
    stateDescription: {
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.sm * 1.5,
      color: colors.secondaryText,
    },
    stateDescriptionInactive: {
      color: palettes.gray[dark ? 600 : 400],
    },
  });
