import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { OfferingCourseOverview } from '@polito/api-client/models/OfferingCourseOverview';

import { groupBy, map } from 'lodash';

import { OfferingCourse } from '../screens/DegreeTracksScreen';

type Props = {
  item: OfferingCourse;
};

const GroupedCourse = ({
  group,
}: {
  group: { name: string; data: OfferingCourseOverview[] };
}) => {
  const { spacing, colors, palettes, fontWeights, fontSizes, dark } =
    useTheme();
  const styles = useStylesheet(createStyles);
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Col
      style={{
        backgroundColor: dark ? colors.surfaceDark : palettes.gray['100'],
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[3],
      }}
    >
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <Row justify="space-between" align="center">
          <Text
            variant="title"
            style={{
              fontSize: fontSizes.md,
              lineHeight: fontSizes.md * 1.4,
              fontWeight: fontWeights.medium,
              maxWidth: '80%',
            }}
          >
            {group.name}
          </Text>
          <Icon
            icon={isExpanded ? faChevronDown : faChevronRight}
            color={colors.secondaryText}
            style={styles.icon}
          />
        </Row>
      </Pressable>
      {isExpanded && (
        <OverviewList
          style={{
            marginVertical: spacing[4],
            marginHorizontal: Platform.select({ ios: spacing[2] }),
          }}
        >
          {group.data.map(course => {
            return <ListItem title={course.name} key={course.name} />;
          })}
        </OverviewList>
      )}
    </Col>
  );
};
export const DegreeTrackSection = ({
  item: { teachingYear, data: courses },
}: Props) => {
  const { spacing, colors, palettes, dark } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const firstLevelCourses = courses.filter(c => !c.group);
  const groupedByGroup = useMemo(
    () =>
      map(
        groupBy(
          courses.filter(c => c.group),
          'group',
        ),
        (value, key) => ({ name: key, data: value }),
      ),
    [courses],
  );

  return (
    <View style={{ marginTop: spacing[2] }}>
      <Text
        variant="subHeading"
        style={[
          styles.subHeading,
          { marginHorizontal: spacing[4], textTransform: 'none' },
        ]}
      >
        {teachingYear}° {t('common.year')}
      </Text>
      <OverviewList
        style={{
          marginHorizontal: spacing[4],
        }}
        rounded={true}
      >
        {firstLevelCourses.map((course, index) => {
          return (
            <ListItem
              title={course.name}
              titleStyle={{
                maxWidth: '80%',
              }}
              titleProps={{
                numberOfLines: undefined,
              }}
              key={`${course.teachingYear.toString()}-${
                course.shortcode
              }-${index}`}
              style={{
                backgroundColor: dark
                  ? colors.surfaceDark
                  : palettes.gray['100'],
              }}
              containerStyle={{
                minHeight: 45,
              }}
              linkTo={{
                screen: 'DegreeCourse',
                params: {
                  courseShortcode: course.shortcode,
                  teachingYear: course.teachingYear,
                },
              }}
              accessibilityRole="button"
              trailingItem={
                <Row>
                  <Text
                    variant="prose"
                    style={{
                      color: palettes.text['500'],
                      marginRight: spacing[2],
                    }}
                  >
                    {course.cfu} {t('common.cfu')}
                  </Text>
                  <Icon
                    icon={faChevronRight}
                    color={colors.secondaryText}
                    style={styles.icon}
                  />
                </Row>
              }
            />
          );
        })}
        {groupedByGroup.map((group, index) => {
          return <GroupedCourse key={index} group={group} />;
        })}
      </OverviewList>
    </View>
  );
};

const createStyles = ({ spacing, palettes, dark }: Theme) =>
  StyleSheet.create({
    icon: {
      marginRight: -spacing[1],
    },
    subHeading: {
      color: dark ? palettes.info['400'] : palettes.info['700'],
      marginBottom: spacing[2],
    },
  });
