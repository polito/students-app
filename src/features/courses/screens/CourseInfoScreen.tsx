import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
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
import { Person } from '@polito/api-client/models/Person';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useScreenReader } from '../../../core/hooks/useScreenReader';
import {
  CourseSectionEnum,
  getCourseKey,
  useGetCourse,
  useGetCourseEditions,
  useGetCourseExams,
} from '../../../core/queries/courseHooks';
import { useGetPersons } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { ExamListItem } from '../../teaching/components/ExamListItem';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { useCourseContext } from '../contexts/CourseContext';

type StaffMember = Person & { courseRole: 'roleHolder' | 'roleCollaborator' };

export const CourseInfoScreen = () => {
  const { t } = useTranslation();
  const courseId = useCourseContext();
  const styles = useStylesheet(createStyles);
  const { fontSizes } = useTheme();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const { data: editions } = useGetCourseEditions(courseId);
  const courseQuery = useGetCourse(courseId);
  const { isScreenReaderEnabled, announce } = useScreenReader();
  const [isScreenReaderEnabledValue, setIsScreenReaderEnabledValue] =
    useState(false);

  const courseExamsQuery = useGetCourseExams(
    courseId,
    courseQuery.data?.shortcode,
  );
  const { queries: staffQueries, isLoading: isStaffLoading } = useGetPersons(
    courseQuery.data?.staff.map(s => s.id),
  );

  const isOffline = useOfflineDisabled();

  const { getParent } = useNavigation();

  useEffect(() => {
    isScreenReaderEnabled().then(isEnabled => {
      if (isEnabled) {
        setIsScreenReaderEnabledValue(isEnabled);
      }
    });
  }, [announce, isScreenReaderEnabled, t]);

  useEffect(() => {
    if (!courseQuery.data || isStaffLoading) {
      return;
    }
    const staffData: StaffMember[] = [];

    staffQueries.forEach((staffQuery, index) => {
      if (!staffQuery.data || isStaffLoading) return;

      staffData.push({
        ...staffQuery.data,
        courseRole:
          courseQuery.data.staff[index].role === 'Titolare'
            ? 'roleHolder'
            : 'roleCollaborator',
      });
    });

    setStaff(staffData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseQuery.data, isStaffLoading]);

  const queryClient = useQueryClient();
  const isGuideDataMissing = useCallback(
    () =>
      queryClient.getQueryData(
        getCourseKey(courseId, CourseSectionEnum.Guide),
      ) === undefined,
    [courseId, queryClient],
  );
  const isGuideDisabled = useOfflineDisabled(isGuideDataMissing);

  const editionAccessibleLabel = useMemo(() => {
    const yearLabel =
      (editions?.length ?? 0) > 0 ? t('courseInfoTab.selectYear') : '';

    return `${courseQuery.data?.teachingPeriod ?? '--'} - ${
      courseQuery.data?.year ?? '--'
    }, ${yearLabel}`;
  }, [
    courseQuery.data?.teachingPeriod,
    courseQuery.data?.year,
    editions?.length,
    t,
  ]);

  const CoursesRow = (
    <View
      style={GlobalStyles.grow}
      importantForAccessibility="yes"
      accessibilityRole="button"
      accessible={true}
    >
      <View accessible accessibilityLabel={editionAccessibleLabel}>
        <StatefulMenuView
          actions={editions ?? []}
          onPressAction={async ({ nativeEvent: { event } }) => {
            // replace current screen with same screen with event id as param
            (
              getParent()! as NativeStackNavigationProp<
                TeachingStackParamList,
                'Course'
              >
            ).replace('Course', {
              id: +event,
              animated: false,
            });
          }}
        >
          <Row justify="flex-start" align="center">
            <Metric
              title={t('common.period')}
              value={`${courseQuery.data?.teachingPeriod ?? '--'} - ${
                courseQuery.data?.year ?? '--'
              }`}
              accessibilityLabel={`${t('degreeCourseScreen.period')}: ${
                courseQuery.data?.teachingPeriod ?? '--'
              } - ${courseQuery.data?.year ?? '--'}`}
            />
            {(editions?.length ?? 0) > 0 && (
              <Icon
                icon={faAngleDown}
                size={14}
                style={styles.periodDropdownIcon}
                color={styles.periodDropdownIcon.color}
              />
            )}
          </Row>
        </StatefulMenuView>
      </View>
    </View>
  );

  const CreditsRow = (
    <Metric
      title={t('courseInfoTab.creditsLabel')}
      value={t('common.creditsWithUnit', {
        credits: courseQuery.data?.cfu,
      })}
      accessibilityLabel={`${t('courseInfoTab.creditsLabel')}: ${
        courseQuery.data?.cfu
      }`}
      style={GlobalStyles.grow}
    />
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          queries={[courseQuery, courseExamsQuery, ...staffQueries]}
          manual
        />
      }
    >
      <SafeAreaView>
        <Section
          accessible
          accessibilityRole="text"
          accessibilityLabel={[
            courseQuery.data?.name,
            t('courseInfoTab.shortcode'),
            courseQuery.data?.shortcode,
          ].join(', ')}
          style={styles.heading}
        >
          <ScreenTitle title={courseQuery.data?.name} />
          <Text variant="caption">{courseQuery.data?.shortcode ?? ' '}</Text>
        </Section>
        {/* this is for ios accessibility*/}
        {isScreenReaderEnabledValue && (
          <View>
            <Card style={styles.metricsCard} accessible={true}>
              {CoursesRow}
            </Card>
            <Card style={styles.metricsCard} accessible={true}>
              {CreditsRow}
            </Card>
          </View>
        )}
        {!isScreenReaderEnabledValue && (
          <Card style={styles.metricsCard} accessible={true}>
            <Grid>
              {CoursesRow}
              {CreditsRow}
            </Grid>
          </Card>
        )}
        {/*  <Section>
          <SectionHeader title={t('courseInfoTab.agendaSectionTitle')} />
          <OverviewList emptyStateText={t('common.comingSoon')}></OverviewList>
        </Section>*/}
        <Section>
          <SectionHeader title={t('courseInfoTab.staffSectionTitle')} />
          <OverviewList
            indented
            loading={
              !courseQuery?.data ||
              ((courseQuery.data?.staff?.length ?? 0) > 0 && staff.length === 0)
            }
          >
            {staff.map(member => (
              <PersonListItem
                key={`${member.id}`}
                person={member}
                subtitle={t(`common.${member.courseRole}`)}
              />
            ))}
          </OverviewList>
        </Section>
        <Section>
          <SectionHeader title={t('examsScreen.title')} />
          <OverviewList
            loading={courseExamsQuery.isLoading}
            indented
            emptyStateText={
              isOffline && courseExamsQuery.isLoading
                ? t('common.cacheMiss')
                : t('examsScreen.emptyState')
            }
          >
            {courseExamsQuery.data?.map(exam => (
              <ExamListItem
                key={`${exam.id}` + exam.moduleNumber}
                exam={exam}
              />
            ))}
          </OverviewList>
        </Section>

        <Section>
          <SectionHeader title={t('courseInfoTab.linksSectionTitle')} />
          <OverviewList
            indented
            loading={!courseQuery?.data}
            emptyStateText={
              isOffline && courseQuery.isLoading
                ? t('common.cacheMiss')
                : t('courseInfoTab.linksSectionEmptyState')
            }
          >
            {courseQuery.data?.links.map((link, index) => (
              <ListItem
                accessible
                accessibilityRole="button"
                key={index}
                accessibilityLabel={[
                  link.description ?? t('courseInfoTab.linkDefaultTitle'),
                  link.url,
                ].join(', ')}
                leadingItem={<Icon icon={faLink} size={fontSizes.xl} />}
                title={link.description ?? t('courseInfoTab.linkDefaultTitle')}
                subtitle={link.url}
                onPress={() => Linking.openURL(link.url)}
              />
            ))}
          </OverviewList>
        </Section>

        <Section>
          <SectionHeader title={t('courseInfoTab.moreSectionTitle')} />
          <OverviewList>
            <ListItem
              accessible
              accessibilityLabel={t('courseGuideScreen.title')}
              accessibilityRole="button"
              title={t('courseGuideScreen.title')}
              linkTo={{ screen: 'CourseGuide', params: { courseId } }}
              disabled={isGuideDisabled}
            />
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ palettes, spacing }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingTop: spacing[5],
      paddingHorizontal: spacing[4],
    },
    metricsCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      marginTop: 0,
      marginBottom: spacing[7],
    },
    periodDropdownIcon: {
      marginLeft: spacing[2],
      marginTop: spacing[4],
      color: palettes.secondary['500'],
    },
  });
