import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, View } from 'react-native';

import {
  faCalendar,
  faClock,
  faNoteSticky,
} from '@fortawesome/free-regular-svg-icons';
import {
  faHourglassEnd,
  faLocationDot,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import {
  formatDate,
  formatReadableDate,
  formatTime,
} from '../../../utils/dates';
import { ExamCTA } from '../components/ExamCTA';
import { ExamStatusBadge } from '../components/ExamStatusBadge';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Exam'>;

export const ExamScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const examsQuery = useGetExams();
  const exam = examsQuery.data?.find(e => e.id === id);
  const teacherQuery = useGetPerson(exam?.teacherId);
  const routes = navigation.getState()?.routes;

  const isOffline = useOfflineDisabled();

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
        accessibleDateTime += `. ${t('common.time')} ${formatTime(
          exam.examStartsAt,
        )}`;
      }
    }

    const classrooms =
      exam?.classrooms && exam?.classrooms !== '-'
        ? `${t('examScreen.location')}: ${exam?.classrooms}`
        : '';
    const teacher = `${t('common.teacher')}: ${teacherQuery.data.firstName} ${
      teacherQuery.data.lastName
    }`;

    return `${exam.courseName}. ${accessibleDateTime}. ${classrooms} ${teacher}`;
  }, [exam, t, teacherQuery]);

  return (
    <>
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
              <Row gap={3}>
                <Row gap={2} align="center">
                  <Icon
                    icon={faCalendar}
                    color={colors.prose}
                    size={fontSizes.md}
                  />
                  <Text style={{ fontSize: fontSizes.md }}>
                    {exam?.examStartsAt
                      ? formatReadableDate(exam.examStartsAt)
                      : t('common.dateToBeDefined')}
                  </Text>
                </Row>
                <Row gap={2} align="center">
                  <Icon
                    icon={faClock}
                    color={colors.prose}
                    size={fontSizes.md}
                  />
                  <Text style={{ fontSize: fontSizes.md }}>
                    {exam?.examStartsAt
                      ? `${formatTime(exam.examStartsAt)} - ${formatTime(
                          exam.examEndsAt!,
                        )}`
                      : t('common.timeToBeDefined')}
                  </Text>
                </Row>
              </Row>
            </Col>
          </View>
          <OverviewList loading={!isOffline && teacherQuery.isLoading} indented>
            <ListItem
              leadingItem={
                <Icon icon={faLocationDot} size={fontSizes['2xl']} />
              }
              title={exam?.classrooms ?? '-'}
              accessibilityLabel={`${t('examScreen.location')}: ${
                exam?.classrooms === '-'
                  ? t('examScreen.noClassroom')
                  : exam?.classrooms
              }`}
              subtitle={t('examScreen.location')}
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
                  ? formatReadableDate(exam?.bookingEndsAt)
                  : t('common.dateToBeDefined')
              }
              subtitle={t('examScreen.bookingEndsAt')}
            />
            <ListItem
              leadingItem={<Icon icon={faUsers} size={fontSizes['2xl']} />}
              inverted
              title={`${exam?.bookedCount}`}
              subtitle={t('examScreen.bookedCount')}
            />
          </OverviewList>
          <CtaButtonSpacer />
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      {exam && <ExamCTA exam={exam} />}
    </>
  );
};
