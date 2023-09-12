import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import {
  faBriefcase,
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
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { CourseStaffInner } from '@polito/api-client/models';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetOfferingCourse } from '../../../core/queries/offeringHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { ServiceStackParamList } from '../components/ServicesNavigator';

const StaffListItem = ({ staff }: { staff: CourseStaffInner }) => {
  const { data: person } = useGetPerson(staff.id);

  return person ? (
    <PersonListItem person={person} subtitle={staff.role} />
  ) : (
    <ListItem title=" - " subtitle={staff?.role} />
  );
};

type Props = NativeStackScreenProps<ServiceStackParamList, 'DegreeCourse'>;
const listTitleProps = { numberOfLines: 4 };
export const DegreeCourseScreen = ({ route }: Props) => {
  const { courseShortcode, year } = route.params;
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const courseQuery = useGetOfferingCourse({ courseShortcode, year });
  const { isLoading } = courseQuery;
  const offeringCourse = courseQuery.data;
  const { name, shortcode } = offeringCourse || {};

  const moreStaffCount = useMemo(() => {
    if (!offeringCourse) return undefined;
    return offeringCourse.staff?.length > 3
      ? offeringCourse.staff?.length - 3
      : undefined;
  }, [offeringCourse]);
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[courseQuery]} manual />}
    >
      <SafeAreaView>
        <LoadingContainer loading={isLoading}>
          <Section>
            <ScreenTitle style={styles.heading} title={name} />
            <Text style={styles.shortCode} variant="caption">
              {shortcode}
            </Text>
          </Section>
          <Card style={styles.metricsCard}>
            <Row justify="space-between">
              <Grid>
                <Metric
                  title={t('common.period')}
                  value={`${offeringCourse?.teachingPeriod ?? '--'} - ${
                    offeringCourse?.year ?? '--'
                  }`}
                  style={GlobalStyles.grow}
                />
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
          <OverviewList style={styles.overviewList}>
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
                  hours: offeringCourse?.hours?.classroomExercise?.toString(),
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
            {offeringCourse?.examMode && (
              <ListItem
                inverted
                title={offeringCourse?.examMode}
                titleStyle={styles.title}
                titleProps={listTitleProps}
                subtitle={t('degreeCourseScreen.examMode')}
              />
            )}
          </OverviewList>
          <Section style={styles.staffSection}>
            <SectionHeader
              title={t('degreeCourseScreen.staff')}
              linkToMoreCount={moreStaffCount}
              linkTo={
                moreStaffCount
                  ? {
                      screen: 'Staff',
                      params: {
                        personIds: offeringCourse?.staff?.map(s => s.id) || [],
                      },
                    }
                  : undefined
              }
            />
            <OverviewList>
              {offeringCourse?.staff.slice(0, 3).map(item => (
                <StaffListItem key={item.id} staff={item} />
              ))}
            </OverviewList>
          </Section>
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
    overviewList: {
      marginTop: spacing[3],
    },
    staffSection: {
      marginTop: spacing[3],
    },
    label: {
      color: palettes.secondary['500'],
    },
  });
