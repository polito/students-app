import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import {
  getTracksCoursesGrouped,
  getTracksCoursesWithoutGroup,
} from '../../../utils/offerings';
import { OfferingCourse } from '../screens/DegreeTracksScreen';
import { CourseTrailingItem } from './course/CourseTrailingItem';
import { GroupCourses } from './course/GroupCourses';

interface DegreeTrackSectionProps {
  item: OfferingCourse;
}

export const DegreeTrackSection = ({ item }: DegreeTrackSectionProps) => {
  const { teachingYear, data: courses } = item;
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const firstLevelCourses = getTracksCoursesWithoutGroup(courses);
  const coursesByGroup = useMemo(
    () => getTracksCoursesGrouped(courses),
    [courses],
  );

  return (
    <View style={styles.trackSectionContainer}>
      <Text variant="subHeading" style={styles.subHeading}>
        {teachingYear}° {t('common.year')}
      </Text>
      <OverviewList rounded={true}>
        {firstLevelCourses.map((course, index) => (
          <ListItem
            title={course.name}
            titleStyle={{ maxWidth: '80%' }}
            titleProps={{ numberOfLines: undefined }}
            key={`${course.teachingYear.toString()}-${
              course.shortcode
            }-${index}`}
            style={styles.listItem}
            containerStyle={styles.listItemContainer}
            linkTo={{
              screen: 'DegreeCourse',
              params: {
                courseShortcode: course.shortcode,
                teachingYear: course.teachingYear,
              },
            }}
            accessibilityRole="button"
            trailingItem={<CourseTrailingItem cfu={course.cfu} />}
          />
        ))}
        {coursesByGroup.map((group, index) => (
          <GroupCourses key={index} group={group} />
        ))}
      </OverviewList>
    </View>
  );
};

const createStyles = ({ spacing, colors, palettes, dark }: Theme) =>
  StyleSheet.create({
    icon: {
      marginRight: -spacing[1],
    },
    subHeading: {
      color: dark ? palettes.info['400'] : palettes.info['700'],
      marginBottom: spacing[2],
      marginHorizontal: spacing[4],
      textTransform: 'none',
    },
    trackSectionContainer: {
      marginTop: spacing[2],
    },
    list: {
      marginHorizontal: spacing[4],
    },
    listItem: {
      backgroundColor: dark ? colors.surfaceDark : palettes.gray['100'],
    },
    listItemContainer: {
      minHeight: 45,
    },
  });
