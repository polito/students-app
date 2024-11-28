import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  getTracksCoursesGrouped,
  getTracksCoursesWithoutGroup,
} from '../../../utils/offerings';
import { useDegreeContext } from '../contexts/DegreeContext';
import { OfferingCourseYear } from '../screens/DegreeTracksScreen';
import { CourseTrailingItem } from './CourseTrailingItem';
import { GroupCourses } from './GroupCourses';

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

  const isOffline = useOfflineDisabled();

  const { year } = useDegreeContext();

  const accessibilityYearLabel = useMemo(() => {
    const textNumber = [
      'first',
      'second',
      'third',
      'quarto',
      'fifth',
      'sixth',
      'seventh',
      'eighth',
      'ninth',
      'tenth',
    ];
    if (teachingYear >= 1 && teachingYear <= 10) {
      return `${t(`common.${textNumber[teachingYear - 1]}`)} ${t(
        'common.year',
      )}`;
    }
    return `${year}° ${t('common.year')}`;
  }, [t, teachingYear, year]);

  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number>();
  return (
    <View style={styles.trackSectionContainer}>
      <Text
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={accessibilityYearLabel}
        variant="subHeading"
        style={styles.subHeading}
      >
        {teachingYear}° {t('common.year')}
      </Text>
      <OverviewList rounded={true} style={styles.firstLevelOverviewList}>
        {firstLevelCourses.map((course, index) => (
          <ListItem
            accessible={true}
            accessibilityLabel={[course.name, course.cfu, t('common.cfu')].join(
              ', ',
            )}
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
                teachingYear: year,
              },
            }}
            accessibilityRole="button"
            trailingItem={<CourseTrailingItem cfu={course.cfu} />}
            disabled={isOffline}
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
            disabled={isOffline}
          />
        ))}
      </OverviewList>
    </View>
  );
};

const createStyles = ({ spacing, colors, palettes, dark }: Theme) =>
  StyleSheet.create({
    firstLevelOverviewList: {
      marginHorizontal: spacing[4],
      elevation: 0,
    },
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
