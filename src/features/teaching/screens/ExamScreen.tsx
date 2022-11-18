import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useBookExam,
  useCancelExamBooking,
  useGetExams,
} from '../../../core/queries/examHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Exam'>;

export const ExamScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const examsQuery = useGetExams();
  const refreshControl = useRefreshControl(examsQuery);
  const exam = examsQuery.data?.data.find(e => e.id === id);
  const bookExamMutation = useBookExam(exam?.id);
  const cancelExamBookingMutation = useCancelExamBooking(exam?.id);
  const teacherQuery = useGetPerson(exam?.teacherId);
  const routes = navigation.getState()?.routes;

  useEffect(() => {
    if (routes[routes.length - 2]?.name === 'Course') {
      navigation.setOptions({
        headerBackTitle: t('Course'),
      });
    }
  }, []);

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl {...refreshControl} />}
        contentContainerStyle={{
          paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <EventDetails
          title={exam?.courseName}
          type={t('common.exam')}
          time={exam?.examStartsAt}
        />
        <SectionList loading={teacherQuery.isLoading} indented>
          <ListItem
            leadingItem={<Icon icon={faLocationDot} size={fontSizes['2xl']} />}
            title={exam?.classrooms}
            subtitle={t('examScreen.location')}
          />
          {teacherQuery.data && (
            <PersonListItem
              person={teacherQuery.data?.data}
              subtitle={t('common.teacher')}
            />
          )}
        </SectionList>
      </ScrollView>

      {exam?.status === ExamStatusEnum.Available && (
        <CtaButton
          title={t('examScreen.ctaBook')}
          onPress={() => bookExamMutation.mutate({})}
          loading={bookExamMutation.isLoading}
          success={bookExamMutation.isSuccess}
          successMessage={t('examScreen.ctaBookSuccess')}
        />
      )}
      {exam?.status === ExamStatusEnum.Booked && (
        <CtaButton
          destructive
          title={t('examScreen.ctaCancel')}
          onPress={() => cancelExamBookingMutation.mutate()}
          loading={cancelExamBookingMutation.isLoading}
          success={cancelExamBookingMutation.isSuccess}
          successMessage={t('examScreen.ctaCancelSuccess')}
        />
      )}
    </>
  );
};
