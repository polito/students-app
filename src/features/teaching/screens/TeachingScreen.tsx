import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { ExamStatusEnum } from '@polito/api-client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SCREEN_WIDTH } from '../../../core/constants';
import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { CourseListItem } from '../components/CourseListItem';
import { ExamListItem } from '../components/ExamListItem';
import { ProgressChart } from '../components/ProgressChart';
import { TeachingStackParamList } from '../components/TeachingNavigator';

interface Props {
  navigation: NativeStackNavigationProp<TeachingStackParamList, 'Home'>;
}

export const TeachingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const preferences = useContext(PreferencesContext);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const coursesQuery = useGetCourses();
  const examsQuery = useGetExams();
  const studentQuery = useGetStudent();

  const refreshControl = useRefreshControl(
    coursesQuery,
    examsQuery,
    studentQuery,
  );
  const exams = useMemo(
    () =>
      examsQuery.data?.data
        .sort(a => (a.status === ExamStatusEnum.Booked ? -1 : 1))
        .slice(0, 4) ?? [],
    [examsQuery],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="always"
      contentContainerStyle={bottomBarAwareStyles}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <View style={styles.sectionsContainer}>
        <Section>
          <SectionHeader
            title={t('coursesScreen.title')}
            linkTo={{ screen: 'Courses' }}
          />
          <SectionList
            loading={coursesQuery.isLoading}
            indented
            emptyStateText={t('coursesScreen.emptyState')}
          >
            {coursesQuery.data?.data
              .sort(
                (a, b) =>
                  preferences.courses[a.id]?.order -
                  preferences.courses[b.id]?.order,
              )
              .filter(c => c.id && !preferences.courses[c.id]?.isHidden)
              .map(course => (
                <CourseListItem
                  key={course.shortcode + '' + course.id}
                  course={course}
                />
              ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader
            title={t('examsScreen.title')}
            linkTo={{ screen: 'Exams' }}
          />
          <SectionList
            loading={examsQuery.isLoading}
            indented
            emptyStateText={t('examsScreen.emptyState')}
          >
            {exams.map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader
            title={t('common.transcript')}
            linkTo={{ screen: 'Transcript' }}
          />

          <Card style={styles.sectionContent}>
            {studentQuery.isLoading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <TouchableHighlight
                onPress={() => navigation.navigate('Transcript')}
                underlayColor={colors.touchableHighlight}
              >
                <View style={{ padding: spacing[5], flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="headline"
                      style={{ marginBottom: spacing[2] }}
                    >
                      {t('transcriptScreen.weightedAverageLabel')}:{' '}
                      {studentQuery.data?.data.averageGrade}
                    </Text>
                    <Text
                      variant="secondaryText"
                      style={{ marginBottom: spacing[2] }}
                    >
                      {t('transcriptScreen.finalAverageLabel')}:{' '}
                      {studentQuery.data?.data.averageGradePurged}
                    </Text>
                    <Text variant="secondaryText">
                      {studentQuery.data?.data.totalAcquiredCredits}/
                      {studentQuery.data?.data.totalCredits}{' '}
                      {t('common.credits').toLowerCase()}
                    </Text>
                  </View>
                  <ProgressChart
                    data={
                      studentQuery.data
                        ? [
                            studentQuery.data?.data.totalAttendedCredits /
                              studentQuery.data?.data.totalCredits,
                            studentQuery.data?.data.totalAcquiredCredits /
                              studentQuery.data?.data.totalCredits,
                          ]
                        : []
                    }
                    colors={[colors.primary[400], colors.secondary[500]]}
                  />
                </View>
              </TouchableHighlight>
            )}
          </Card>
        </Section>
        <Section>
          <SectionHeader title={t('common.services')} />
          <SectionList>
            <ListItem
              leadingItem={<Icon icon={faComments} size={20} />}
              title={t('common.tickets')}
              linkTo={{ screen: 'Tickets' }}
            />
          </SectionList>
        </Section>
      </View>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    sectionsContainer: {
      // backgroundColor: 'red',
      width: SCREEN_WIDTH,
      paddingVertical: spacing[5],
    },
    section: {
      marginBottom: spacing[5],
    },
    loader: {
      marginVertical: spacing[8],
    },
    sectionContent: {
      marginVertical: spacing[2],
    },
  });
