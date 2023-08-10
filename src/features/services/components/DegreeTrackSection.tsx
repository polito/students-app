import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { OfferingCourse } from '../screens/DegreeTracksScreen';

type Props = {
  item: OfferingCourse;
};
export const DegreeTrackSection = ({
  item: { teachingYear, data: courses },
}: Props) => {
  const { spacing, colors, palettes } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
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
        {courses.map((course, index) => {
          return (
            <ListItem
              title={course.name}
              titleStyle={{
                maxWidth: '70%',
              }}
              titleProps={{
                numberOfLines: undefined,
              }}
              key={`${course.teachingYear.toString()}-${
                course.shortcode
              }-${index}`}
              style={{
                backgroundColor: palettes.gray['100'],
              }}
              containerStyle={{
                minHeight: 45,
              }}
              linkTo={{
                screen: 'DegreeCourse',
                params: {
                  courseShortcode: course.shortcode,
                },
              }}
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
      </OverviewList>
    </View>
  );
};

const createStyles = ({ spacing, palettes }: Theme) =>
  StyleSheet.create({
    icon: {
      marginRight: -spacing[1],
    },
    subHeading: {
      color: palettes.info['700'],
      marginBottom: spacing[2],
    },
  });
