import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
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
        refreshControl={createRefreshControl(examsQuery)}
        contentContainerStyle={{
          paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <EventDetails
          title={exam?.courseName || ''}
          type={t('words.exam')}
          time={exam?.examStartsAt}
        />
        <SectionList loading={teacherQuery.isLoading}>
          <ListItem
            leadingItem={
              <Icon
                name="location"
                style={{ color: colors.secondaryText, marginRight: spacing[4] }}
                size={fontSizes['2xl']}
              />
            }
            title={exam?.classrooms}
            subtitle={''}
          />
          {teacherQuery.data && (
            <PersonListItem
              person={teacherQuery.data?.data}
              subtitle={t('words.teacher')}
            />
          )}
        </SectionList>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing[4],
          paddingBottom: bottomBarAwareStyles.paddingBottom,
        }}
      >
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
            title={t('examScreen.ctaCancel')}
            onPress={() => cancelExamBookingMutation.mutate()}
            loading={cancelExamBookingMutation.isLoading}
            success={cancelExamBookingMutation.isSuccess}
            successMessage={t('examScreen.ctaCancelSuccess')}
          />
        )}
      </View>
    </>
  );
};
