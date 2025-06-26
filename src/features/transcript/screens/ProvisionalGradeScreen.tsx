import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Col } from '@lib/ui/components/Col';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { ProvisionalGradeStateEnum } from '@polito/api-client/models/ProvisionalGrade';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useAcceptProvisionalGrade,
  useGetProvisionalGrades,
  useRejectProvisionalGrade,
} from '../../../core/queries/studentHooks';
import { formatDate, formatDateWithTimeIfNotNull } from '../../../utils/dates';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { GradeStates } from '../components/GradeStates';
import { TeacherMessage } from '../components/TeacherMessage.tsx';
import { useGetRejectionTime } from '../hooks/useGetRejectionTime';

type Props = NativeStackScreenProps<TeachingStackParamList, 'ProvisionalGrade'>;

export const ProvisionalGradeScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { setFeedback } = useFeedbackContext();
  const { fontWeights } = useTheme();

  const confirmAcceptance = useConfirmationDialog({
    title: t('common.areYouSure?'),
    message: t('provisionalGradeScreen.acceptGradeConfirmMessage'),
  });

  const confirmRejection = useConfirmationDialog({
    title: t('common.areYouSure?'),
    message: t('provisionalGradeScreen.rejectGradeConfirmMessage'),
  });

  const { id } = route.params;

  const gradesQuery = useGetProvisionalGrades();
  const grade = useMemo(
    () => gradesQuery.data?.find(g => g.id === id),
    [gradesQuery.data, id],
  );
  const rejectionTime = useGetRejectionTime({
    rejectingExpiresAt: grade?.rejectingExpiresAt,
  });

  const acceptGradeQuery = useAcceptProvisionalGrade();
  const rejectGradeQuery = useRejectProvisionalGrade();

  const isOffline = useOfflineDisabled();

  const provideFeedback = useCallback(
    (wasAccepted: boolean) => {
      if (wasAccepted) {
        setFeedback({
          text: t('provisionalGradeScreen.acceptGradeFeedback'),
          isPersistent: false,
        });
      } else {
        setFeedback({
          text: t('provisionalGradeScreen.rejectGradeFeedback'),
          isPersistent: false,
        });
      }

      navigation.goBack();
    },
    [navigation, setFeedback, t],
  );

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl queries={[gradesQuery]} manual />}
      >
        {grade === undefined ? (
          <ActivityIndicator />
        ) : (
          <SafeAreaView>
            <Row
              pb={
                grade.state === ProvisionalGradeStateEnum.Confirmed &&
                (grade.canBeAccepted || grade.canBeRejected) &&
                rejectionTime
                  ? 0
                  : 5
              }
              ph={5}
              pt={5}
              gap={2}
            >
              <Col flexGrow={1} flexShrink={1} gap={2}>
                <ScreenTitle title={grade.courseName} />
                <Text>{`${formatDate(grade.date)} - ${t(
                  'common.creditsWithUnit',
                  {
                    credits: grade.credits,
                  },
                )}`}</Text>
              </Col>
              <Col
                align="center"
                justify="center"
                mt={2}
                flexShrink={0}
                style={styles.grade}
              >
                <Text
                  style={[
                    grade.grade.length < 3
                      ? styles.gradeText
                      : styles.longGradeText,
                    grade.isFailure || grade.isWithdrawn
                      ? styles.failureGradeText
                      : undefined,
                  ]}
                  numberOfLines={1}
                >
                  {grade.grade}
                </Text>
              </Col>
            </Row>
            {grade.state === ProvisionalGradeStateEnum.Confirmed &&
              grade.canBeAccepted &&
              rejectionTime && (
                <Row pl={5} pb={5}>
                  <Text style={styles.autoRegistration}>
                    {t('transcriptGradesScreen.autoRegistration')}
                    <Text
                      style={[
                        styles.autoRegistration,
                        { fontWeight: fontWeights.medium },
                      ]}
                    >
                      {rejectionTime}
                    </Text>
                  </Text>
                </Row>
              )}
            {grade.teacherMessage && (
              <TeacherMessage message={grade.teacherMessage} />
            )}

            <GradeStates state={grade?.state} />
            {grade?.state === ProvisionalGradeStateEnum.Confirmed && (
              <CtaButtonSpacer />
            )}
            <CtaButtonSpacer />
          </SafeAreaView>
        )}
        <BottomBarSpacer />
      </ScrollView>
      {grade?.state === ProvisionalGradeStateEnum.Published && (
        <CtaButton
          title={t('provisionalGradeScreen.contactProfessorCta')}
          action={() => navigation.navigate('Person', { id: grade?.teacherId })}
        />
      )}
      {grade?.state === ProvisionalGradeStateEnum.Confirmed && (
        <CtaButtonContainer
          absolute={true}
          modal={Platform.select({ android: true })}
        >
          {grade?.canBeAccepted && (
            <CtaButton
              title={t('provisionalGradeScreen.acceptGradeCta')}
              action={() =>
                confirmAcceptance().then(ok => {
                  if (ok) {
                    acceptGradeQuery
                      .mutateAsync(grade.id)
                      .then(() => provideFeedback(true));
                  }
                })
              }
              absolute={false}
              loading={acceptGradeQuery.isLoading}
              disabled={
                isOffline ||
                acceptGradeQuery.isLoading ||
                rejectGradeQuery.isLoading
              }
              containerStyle={{ paddingVertical: 0 }}
            />
          )}
          {grade?.canBeRejected && (
            <CtaButton
              title={t('provisionalGradeScreen.rejectGradeCta', {
                date: formatDateWithTimeIfNotNull(grade.rejectingExpiresAt),
              })}
              action={() =>
                confirmRejection().then(ok => {
                  if (ok) {
                    rejectGradeQuery
                      .mutateAsync(grade.id)
                      .then(() => provideFeedback(false));
                  }
                })
              }
              absolute={false}
              loading={rejectGradeQuery.isLoading}
              variant="outlined"
              disabled={
                isOffline ||
                acceptGradeQuery.isLoading ||
                rejectGradeQuery.isLoading
              }
              containerStyle={{ paddingVertical: 0 }}
              destructive
              style={{ marginBottom: 40 }}
            />
          )}
        </CtaButtonContainer>
      )}
    </>
  );
};
const createStyles = ({
  colors,
  dark,
  fontSizes,
  palettes,
  spacing,
  fontWeights,
}: Theme) =>
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
    // eslint-disable-next-line react-native/no-color-literals
    grade: {
      minWidth: 60,
      height: 60,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing[2],
    },
    gradeText: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semibold,
    },
    longGradeText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
    },
    failureGradeText: {
      color: palettes.rose[600],
    },
    rejectionTime: {
      color: dark ? palettes.danger[300] : palettes.danger[700],
    },
    autoRegistration: {
      fontSize: fontSizes.md,
      color: dark ? palettes.primary[300] : palettes.primary[600],
    },
  });
