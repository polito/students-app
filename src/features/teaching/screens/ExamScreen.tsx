import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { faNoteSticky } from '@fortawesome/free-regular-svg-icons';
import {
  faHourglassEnd,
  faTriangleExclamation,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { ErrorCard } from '@lib/ui/components/ErrorCard';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenDateTime } from '@lib/ui/components/ScreenDateTime';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { BottomModal } from '../../../core/components/BottomModal';
import { useBottomModal } from '../../../core/hooks/useBottomModal';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import {
  useGetAllCpdSurveys,
  useGetCpdSurveys,
} from '../../../core/queries/surveysHooks';
import {
  dateFormatter,
  formatDate,
  formatDateTime,
  formatReadableDate,
} from '../../../utils/dates';
import { PlacesListItem } from '../../places/components/PlacesListItem';
import { ExamCpdModalContent } from '../../surveys/components/ExamCpdModalContent';
import { ExamCTA } from '../components/ExamCTA';
import { ExamRescheduleCTA } from '../components/ExamRescheduleCTA';
import { ExamStatusBadge } from '../components/ExamStatusBadge';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { getExam, isExamPassed } from '../utils/exam';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Exam'>;

export const ExamScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { fontSizes, spacing } = useTheme();
  const examsQuery = useGetExams();
  const cpdSurveysQuery = useGetAllCpdSurveys();
  const cpd = useGetCpdSurveys();
  const exam = examsQuery.data?.find(e => e.id === id);
  const teacherQuery = useGetPerson(exam?.teacherId);
  const routes = navigation.getState()?.routes;

  const {
    open: showBottomModal,
    modal: bottomModal,
    close: closeBottomModal,
  } = useBottomModal();
  const isOffline = useOfflineDisabled();
  const formatHHmm = dateFormatter('HH:mm');
  useEffect(() => {
    if (routes[routes.length - 2]?.name === 'Course') {
      navigation.setOptions({
        headerBackTitle: t('common.course'),
      });
    }
  }, [navigation, routes, t]);

  const examAccessibilityLabel = useMemo(() => {
    if (!exam || !teacherQuery.data) return;

    let accessibleDateTime: string;
    if (!exam.examStartsAt) {
      accessibleDateTime = t('common.dateToBeDefined');
    } else {
      accessibleDateTime = formatDate(exam.examStartsAt);

      if (exam.isTimeToBeDefined) {
        accessibleDateTime += `, ${t('common.timeToBeDefined')}`;
      } else {
        accessibleDateTime += `. ${t('common.time')} ${formatHHmm(
          exam.examStartsAt,
        )}`;
      }
    }

    const classrooms = exam?.places?.map(p => p.name).join(', ');
    const teacher = `${t('common.teacher')}: ${teacherQuery.data.firstName} ${
      teacherQuery.data.lastName
    }`;

    return `${exam.courseName}. ${accessibleDateTime}. ${classrooms} ${teacher}`;
  }, [exam, t, teacherQuery]);

  useLayoutEffect(() => {
    if (!cpdSurveysQuery.data || !exam) return;

    const getPeriodo = cpdSurveysQuery.data.filter(s => {
      return s.type.id === 'STUDENTE' && s.course?.id === exam.courseId;
    });

    const requirements = cpdSurveysQuery.data.filter(s => {
      return (
        ((s.type.id === 'CPDPERIODO' &&
          getPeriodo.filter(g => g.period === s.period).length > 0) ||
          (s.type.id === 'STUDENTE' && s.course?.id === exam.courseId)) &&
        !s.isCompiled
      );
    });

    if (!requirements.length) return;
    showBottomModal(
      <ExamCpdModalContent surveys={requirements} close={closeBottomModal} />,
    );
  }, [cpdSurveysQuery.data, exam]);

  return (
    <>
      <BottomModal dismissable {...bottomModal} />
      <ScrollView
        refreshControl={<RefreshControl queries={[examsQuery]} manual />}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SafeAreaView>
          <View
            style={{ padding: spacing[5] }}
            accessible={true}
            accessibilityLabel={examAccessibilityLabel}
          >
            <ScreenTitle
              style={{ marginBottom: spacing[2] }}
              title={exam?.courseName}
            />
            <Col gap={2}>
              <Row justify="space-between" align="center">
                <Text
                  variant="caption"
                  style={{ flexShrink: 1, marginRight: spacing[2] }}
                >
                  {exam?.type}
                </Text>
                {exam?.status && <ExamStatusBadge exam={exam} />}
              </Row>
              <ScreenDateTime
                accessible={true}
                date={
                  exam
                    ? exam.examStartsAt
                      ? formatReadableDate(exam.examStartsAt)
                      : t('common.dateToBeDefined')
                    : ''
                }
                time={
                  exam
                    ? exam?.examStartsAt
                      ? `${formatHHmm(exam.examStartsAt)} - ${formatHHmm(
                          exam.examEndsAt!,
                        )}`
                      : t('common.timeToBeDefined')
                    : ''
                }
              />
            </Col>
          </View>
          <OverviewList loading={!isOffline && teacherQuery.isLoading} indented>
            <PlacesListItem
              eventName={exam?.courseName ?? ''}
              places={exam?.places}
            />
            {teacherQuery.data && (
              <PersonListItem
                person={teacherQuery.data}
                subtitle={t('common.teacher')}
              />
            )}
            {exam?.notes?.length && (
              <ListItem
                leadingItem={
                  <Icon icon={faNoteSticky} size={fontSizes['2xl']} />
                }
                title={exam.notes}
                accessibilityLabel="a"
                subtitle={t('examScreen.notes')}
                inverted
                titleProps={{ numberOfLines: 0 }}
              />
            )}
            <ListItem
              leadingItem={
                <Icon icon={faHourglassEnd} size={fontSizes['2xl']} />
              }
              inverted
              title={
                exam?.bookingEndsAt
                  ? formatDateTime(exam?.bookingEndsAt)
                  : t('common.dateToBeDefined')
              }
              subtitle={t('examScreen.bookingEndsAt')}
              trailingItem={
                exam?.status === ExamStatusEnum.Unavailable &&
                exam?.bookingEndsAt &&
                isExamPassed(exam.bookingEndsAt) ? (
                  <Icon
                    icon={faTriangleExclamation}
                    color="red"
                    size={fontSizes.md}
                  />
                ) : undefined
              }
            />

            <ListItem
              leadingItem={<Icon icon={faUsers} size={fontSizes['2xl']} />}
              inverted
              /* check using undefined since the fields can be 0 */
              title={
                exam?.bookedCount !== undefined
                  ? getExam(exam.bookedCount, exam.availableCount)
                  : t('examScreen.noBookedCount')
              }
              subtitle={t('examScreen.bookedCount')}
              trailingItem={
                exam?.status === ExamStatusEnum.Unavailable &&
                exam.availableCount === 0 ? (
                  <Icon
                    icon={faTriangleExclamation}
                    color="red"
                    size={fontSizes.md}
                  />
                ) : undefined
              }
            />
          </OverviewList>
          {exam?.feedback && exam?.status === ExamStatusEnum.Unavailable && (
            <ErrorCard text={exam.feedback} />
          )}
          <CtaButtonSpacer />
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      <CtaButtonContainer absolute={true}>
        {exam?.isReschedulable &&
          exam?.status === ExamStatusEnum.Available &&
          exam && <ExamRescheduleCTA exam={exam} />}
        {exam && <ExamCTA exam={exam} absolute={false} />}
      </CtaButtonContainer>
      <CtaButtonSpacer />
    </>
  );
};
