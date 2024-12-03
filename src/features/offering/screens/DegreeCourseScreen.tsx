import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  faAngleDown,
  faBriefcase,
  faChartLine,
  faFlaskVial,
  faMicroscope,
  faPersonChalkboard,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuAction } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetOfferingCourse } from '../../../core/queries/offeringHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { StaffListItem } from '../components/StaffListItem';

type Props = NativeStackScreenProps<ServiceStackParamList, 'DegreeCourse'>;
const listTitleProps = { numberOfLines: 4 };
export const DegreeCourseScreen = ({ route }: Props) => {
  const { courseShortcode, year: initialYear } = route.params;
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [currentYear, setCurrentYear] = useState(initialYear);

  const isOffline = useOfflineDisabled();

  const courseQuery = useGetOfferingCourse({
    courseShortcode,
    year: selectedYear,
  });
  const { palettes, spacing } = useTheme();
  const offeringCourse = courseQuery.data;

  const moreStaffCount = useMemo(() => {
    if (!offeringCourse) return undefined;
    return offeringCourse.staff?.length > 3
      ? offeringCourse.staff?.length - 3
      : undefined;
  }, [offeringCourse]);

  useEffect(() => {
    if (!offeringCourse) return;
    setCurrentYear(offeringCourse.year);
  }, [offeringCourse]);

  const yearOptions = useMemo(() => {
    if (
      !offeringCourse?.editions ||
      isOffline ||
      !currentYear ||
      offeringCourse.editions.length < 2
    )
      return [];
    return offeringCourse.editions?.map(
      edition =>
        ({
          id: edition.toString(),
          title: edition,
          state: edition === currentYear ? 'on' : undefined,
        } as MenuAction),
    );
  }, [currentYear, isOffline, offeringCourse]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[courseQuery]} manual />}
    >
      <SafeAreaView>
        <LoadingContainer loading={courseQuery.isLoading}>
          <Section>
            <ScreenTitle style={styles.heading} title={offeringCourse?.name} />
            <Text style={styles.shortCode} variant="caption">
              {offeringCourse?.shortcode}
            </Text>
          </Section>
          <Card style={styles.metricsCard}>
            <Row justify="space-between">
              <Grid>
                <View
                  style={GlobalStyles.grow}
                  importantForAccessibility="yes"
                  accessibilityRole="button"
                  accessible={true}
                >
                  <StatefulMenuView
                    actions={yearOptions}
                    onPressAction={async ({ nativeEvent: { event } }) => {
                      setSelectedYear(() => event);
                      await courseQuery.refetch();
                    }}
                  >
                    <Row justify="flex-start" align="center">
                      <Metric
                        title={t('degreeCourseScreen.period')}
                        value={`${offeringCourse?.teachingPeriod ?? '--'} - ${
                          currentYear ?? '--'
                        }`}
                        accessibilityLabel={`${t(
                          'degreeCourseScreen.period',
                        )}: ${offeringCourse?.teachingPeriod ?? '--'} - ${
                          currentYear ?? '--'
                        }`}
                      />
                      {yearOptions.length > 0 && (
                        <Icon
                          icon={faAngleDown}
                          color={palettes.secondary['500']}
                          size={14}
                          style={{
                            marginLeft: spacing[2],
                            marginTop: spacing[4],
                          }}
                        />
                      )}
                    </Row>
                  </StatefulMenuView>
                </View>

                <Metric
                  title={t('courseInfoTab.creditsLabel')}
                  value={t('common.creditsWithUnit', {
                    credits: offeringCourse?.cfu,
                  })}
                  accessibilityLabel={`${t('courseInfoTab.creditsLabel')}: ${
                    offeringCourse?.cfu
                  }`}
                  style={GlobalStyles.grow}
                />
              </Grid>
            </Row>
          </Card>
          {offeringCourse?.hours &&
            (offeringCourse.hours?.lecture ||
              offeringCourse.hours?.classroomExercise ||
              offeringCourse.hours?.labExercise ||
              offeringCourse.hours?.tutoring) && (
              <OverviewList>
                {!!offeringCourse?.hours?.lecture && (
                  <ListItem
                    inverted
                    title={t('degreeCourseScreen.hours', {
                      hours: offeringCourse?.hours?.lecture?.toString(),
                    })}
                    titleStyle={styles.title}
                    titleProps={listTitleProps}
                    subtitle={t('degreeCourseScreen.lecture')}
                    leadingItem={<Icon size={20} icon={faBriefcase} />}
                  />
                )}
                {!!offeringCourse?.hours?.classroomExercise && (
                  <ListItem
                    inverted
                    title={t('degreeCourseScreen.hours', {
                      hours:
                        offeringCourse?.hours?.classroomExercise?.toString(),
                    })}
                    titleStyle={styles.title}
                    titleProps={listTitleProps}
                    subtitle={t('degreeCourseScreen.classroomExercise')}
                    leadingItem={<Icon size={20} icon={faMicroscope} />}
                  />
                )}
                {!!offeringCourse?.hours?.labExercise && (
                  <ListItem
                    inverted
                    title={t('degreeCourseScreen.hours', {
                      hours: offeringCourse?.hours?.labExercise?.toString(),
                    })}
                    titleStyle={styles.title}
                    titleProps={listTitleProps}
                    subtitle={t('degreeCourseScreen.labExercise')}
                    leadingItem={<Icon size={20} icon={faFlaskVial} />}
                  />
                )}
                {!!offeringCourse?.hours?.tutoring && (
                  <ListItem
                    inverted
                    title={t('degreeCourseScreen.hours', {
                      hours: offeringCourse?.hours?.tutoring?.toString(),
                    })}
                    titleStyle={styles.title}
                    titleProps={listTitleProps}
                    subtitle={t('degreeCourseScreen.tutoring')}
                    leadingItem={<Icon size={20} icon={faPersonChalkboard} />}
                  />
                )}
                {offeringCourse && (
                  <ListItem
                    title={t('degreeCourseScreen.statistics')}
                    titleStyle={styles.title}
                    titleProps={listTitleProps}
                    subtitle={t('degreeCourseScreen.statistics')}
                    linkTo={{
                      screen: 'CourseStatistics',
                      params: {
                        courseShortcode: offeringCourse.shortcode,
                      },
                    }}
                    leadingItem={<Icon size={20} icon={faChartLine} />}
                  />
                )}
              </OverviewList>
            )}

          <Section style={styles.staffSection}>
            <SectionHeader
              title={t('degreeCourseScreen.staff')}
              linkToMoreCount={moreStaffCount}
              linkTo={
                moreStaffCount
                  ? {
                      screen: 'Staff',
                      params: {
                        courseShortcode: offeringCourse?.shortcode,
                        year: initialYear,
                        staff: offeringCourse!.staff,
                      },
                    }
                  : undefined
              }
            />
            <OverviewList emptyStateText={t('degreeCourseScreen.noStaff')}>
              {offeringCourse?.staff.slice(0, 3).map(item => (
                <StaffListItem
                  key={`${item.id}${item.courseId}`}
                  staff={item}
                />
              ))}
            </OverviewList>
          </Section>
          <Section>
            <SectionHeader title={t('common.other')} />
            <OverviewList>
              <ListItem
                title={t('courseGuideScreen.title')}
                linkTo={{
                  screen: 'DegreeCourseGuide',
                  params: {
                    courseShortcode: offeringCourse?.shortcode,
                    year: initialYear,
                  },
                }}
              />
            </OverviewList>
          </Section>
          <BottomBarSpacer />
        </LoadingContainer>
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, palettes, fontSizes }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingHorizontal: Platform.select({
        android: spacing[2],
        ios: spacing[4],
      }),
      paddingTop: spacing[2],
      marginBottom: spacing[1],
    },
    metricsCard: {
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      marginTop: 0,
      marginBottom: spacing[7],
    },
    shortCode: {
      paddingHorizontal: Platform.select({
        android: spacing[2],
        ios: spacing[4],
      }),
    },
    title: {
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.md * 1.2,
    },
    staffSection: {},
    label: {
      color: palettes.secondary['500'],
    },
  });
