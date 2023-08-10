import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faChevronDown,
  faChevronRight,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { OfferingCourseOverview } from '@polito/api-client/models/OfferingCourseOverview';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { DegreeContext } from '../context/DegreeContext';

type OfferingCourse = {
  teachingYear: number;
  data: OfferingCourseOverview[];
};

type DegreeTracksSection = {
  title: string;
  isExpanded?: boolean;
  data: OfferingCourse[];
};

export const DegreeTracksScreen = () => {
  const { degreeId, year } = useContext(DegreeContext);
  const degreeQuery = useGetOfferingDegree({
    degreeId: degreeId as string,
    year,
  });
  const { spacing, colors, palettes } = useTheme();
  const { t } = useTranslation();
  const degree = degreeQuery?.data?.data;
  const safeAreaInsets = useSafeAreaInsets();
  const isLoading = degreeQuery.isLoading;
  const styles = useStylesheet(createStyles);
  const sectionListRef =
    useRef<SectionList<OfferingCourse, DegreeTracksSection>>(null);
  const [sections, setSections] = useState<DegreeTracksSection[]>([]);

  const toggleSection = (sectionTitle: string) => {
    setSections(oldS => {
      return oldS.map((section, index) => {
        let isExpanded = false;
        let data: unknown = [];
        if (section.title === sectionTitle) {
          isExpanded = !section.isExpanded;
        }

        if (isExpanded && !section.data.length) {
          data = degree?.tracks?.[index]?.courses.reduce((acc, item) => {
            const { teachingYear } = item;
            const offeringCourse = acc.find(
              i => i.teachingYear === teachingYear,
            );
            if (offeringCourse) {
              offeringCourse.data.push(item);
            } else {
              acc.push({
                teachingYear: teachingYear,
                data: [item],
              });
            }
            return acc;
          }, [] as OfferingCourse[]);
        }

        return {
          title: section.title,
          isExpanded,
          data,
        } as DegreeTracksSection;
      });
    });
  };
  useEffect(() => {
    if (!isLoading) {
      setSections(() => {
        return (degree?.tracks || [])?.map(track => {
          return {
            title: track.name,
            data: [],
            isExpanded: false,
          };
        });
      });
    }
  }, [isLoading, degree?.tracks]);

  return (
    <OverviewList loading={isLoading}>
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item, index) => `${item.teachingYear}-${index}`}
        renderSectionHeader={({ section: { title, isExpanded } }) => (
          <Pressable
            onPress={() => toggleSection(title)}
            accessibilityLabel={`${title}. ${t(
              `common.openedStatus.${isExpanded}`,
            )}. ${t(`common.openedStatusAction.${isExpanded}`)}`}
          >
            <View
              style={{
                paddingLeft: safeAreaInsets.left,
                paddingRight: safeAreaInsets.right,
                paddingVertical: spacing[3],
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderColor: colors.divider,
                backgroundColor: colors.surface,
              }}
            >
              <SectionHeader
                title={title}
                separator={false}
                trailingItem={
                  <Icon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    color={colors.secondaryText}
                  />
                }
              />
            </View>
          </Pressable>
        )}
        renderItem={({ item: { data: courses, teachingYear } }) => {
          return (
            <>
              <Text
                variant="subHeading"
                style={[styles.subHeading, { marginHorizontal: spacing[4] }]}
              >
                {teachingYear}° anno
              </Text>
              <OverviewList>
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
                        screen: 'Course',
                        params: {
                          shortCode: course.shortcode,
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
            </>
          );
        }}
      />
    </OverviewList>
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
