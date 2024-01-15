import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Col } from '@lib/ui/components/Col';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { ProvisionalGradeStateEnum } from '@polito/api-client/models/ProvisionalGrade';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetProvisionalGrades } from '../../../core/queries/studentHooks';
import { formatDate } from '../../../utils/dates';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { useGetRejectionTime } from '../hooks/useGetRejectionTime';

type Props = NativeStackScreenProps<TeachingStackParamList, 'ProvisionalGrade'>;

export const ProvisionalGradeScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  const gradesQuery = useGetProvisionalGrades();
  const grade = useMemo(
    () => gradesQuery.data?.find(g => g.id === route.params.id),
    [gradesQuery.data],
  );

  const rejectionTime = useGetRejectionTime({
    rejectingExpiresAt: grade?.rejectingExpiresAt,
  });

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[gradesQuery]} manual />}
    >
      {grade === undefined ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView>
          <Row p={5}>
            <Col flexGrow={1} gap={2}>
              <ScreenTitle title={grade.courseName} />
              <Text>{`${formatDate(grade.date)} - ${t(
                'common.creditsWithUnit',
                { credits: grade.credits },
              )}`}</Text>
              {grade.state === ProvisionalGradeStateEnum.Confirmed &&
                rejectionTime && (
                  <Text style={styles.rejectionTime}>{rejectionTime}</Text>
                )}
            </Col>
            <Col>
              <View>
                <Text>{grade.grade}</Text>
              </View>
            </Col>
          </Row>
        </SafeAreaView>
      )}
    </ScrollView>
  );
};

const createStyles = ({ dark, palettes, spacing }: Theme) =>
  StyleSheet.create({
    chartCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    metricsCard: {
      padding: spacing[4],
      marginTop: spacing[2],
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    additionalMetric: {
      marginTop: spacing[4],
    },
    grade: {
      marginLeft: spacing[2],
    },
    rejectionTime: {
      color: dark ? palettes.danger[300] : palettes.danger[700],
    },
  });
