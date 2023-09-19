import { useMemo, useState } from 'react';
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
import { OfferingCourseYear } from '../screens/DegreeTracksScreen';
import { CourseTrailingItem } from './course/CourseTrailingItem';
import { GroupCourses } from './course/GroupCourses';

interface DegreeTrackYearProps {
  item: OfferingCourseYear;
}

export const DegreeTrackYear = ({ item }: DegreeTrackYearProps) => {
  const { teachingYear, data: courses } = item;
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const firstLevelCourses = getTracksCoursesWithoutGroup(courses);
  const coursesByGroup = useMemo(
    () => getTracksCoursesGrouped(courses),
    [courses],
  );

  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number>();

  return (
    <View style={styles.trackSectionContainer}>
      <Text variant="subHeading" style={styles.subHeading}>
        {teachingYear}° {t('common.year')}
      </Text>
      <OverviewList rounded={true}>
        {firstLevelCourses.map((course, index) => (
          <ListItem
            title={course.name}
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
              },
            }}
            accessibilityRole="button"
            trailingItem={<CourseTrailingItem cfu={course.cfu} />}
          />
        ))}
        {coursesByGroup.map((group, index) => (
          <GroupCourses
            key={index}
            group={group}
            isExpanded={expandedGroupIndex === index}
            toggleExpand={() =>
              setExpandedGroupIndex(prevIndex =>
                prevIndex !== index ? index : undefined,
              )
            }
          />
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
