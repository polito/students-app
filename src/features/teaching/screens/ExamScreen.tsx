import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito-it/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBookExam, useGetExams } from '../../../core/queries/examHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Exam'>;

export const ExamScreen = ({ route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarHeight = useBottomTabBarHeight();
  const examsQuery = useGetExams();
  const exam = examsQuery.data?.data.find(e => e.id === id);
  const bookExamMutation = useBookExam(exam?.id);
  const teacherQuery = useGetPerson(`${exam?.teacherId}`);

  return (
    <>
      <ScrollView refreshControl={createRefreshControl(examsQuery)}>
        <EventDetails
          title={exam?.courseName}
          type={t('Exam')}
          time={exam?.examStartsAt}
        />
        <SectionList loading={teacherQuery.isLoading}>
          <ListItem
            leadingItem={
              <Ionicons
                name="location"
                style={{ color: colors.secondaryText, marginRight: spacing[4] }}
                size={fontSizes['2xl']}
              />
            }
            title={exam?.classrooms}
            subtitle={t('Location')}
          />
          {teacherQuery.data && (
            <ListItem
              leadingItem={
                <Ionicons
                  name="person"
                  style={{
                    color: colors.secondaryText,
                    marginRight: spacing[4],
                  }}
                  size={fontSizes['2xl']}
                />
              }
              title={`${teacherQuery.data.data.firstName} ${teacherQuery.data.data.lastName}`}
              subtitle={t('Course holder')}
            />
          )}
        </SectionList>
      </ScrollView>

      {exam?.status === ExamStatusEnum.Available && bookExamMutation.isIdle && (
        <View style={{ marginBottom: bottomBarHeight, padding: spacing[4] }}>
          <CtaButton
            title={t('Book exam')}
            onPress={() => bookExamMutation.mutate({})}
            loading={bookExamMutation.isLoading}
            success={bookExamMutation.isSuccess}
            successMessage={t('Exam booked')}
          />
        </View>
      )}
    </>
  );
};
