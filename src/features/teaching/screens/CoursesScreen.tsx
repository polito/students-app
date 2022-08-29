import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourses } from '../hooks/courseHooks';

export const CoursesScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const { data: coursesResponse, isLoading: isLoadingCourses } =
    useGetCourses();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[bottomBarAwareStyles, { paddingVertical: spacing[5] }]}
    >
      {isLoadingCourses ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        Object.entries(
          coursesResponse.data.reduce((byPeriod, course) => {
            (byPeriod[course.teachingPeriod] =
              byPeriod[course.teachingPeriod] ?? []).push(course);
            return byPeriod;
          }, {} as Record<string, Array<typeof coursesResponse.data[0]>>),
        ).map(([period, courses]) => (
          <Section key={period}>
            <SectionHeader
              title={
                period !== 'undefined'
                  ? `${t('Period')} ${period}`
                  : t('Other courses')
              }
            />
            <SectionList>
              {courses.map(c => (
                <ListItem
                  key={c.shortcode}
                  linkTo={{
                    screen: 'Course',
                    params: { id: c.id, courseName: c.name },
                  }}
                  title={c.name}
                  subtitle={`${c.cfu} ${t('Credits').toLowerCase()}`}
                />
              ))}
            </SectionList>
          </Section>
        ))
      )}
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    loader: {
      marginVertical: spacing[8],
    },
  });
