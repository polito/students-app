import { useEffect, useState } from 'react';
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
  faFlaskVial,
  faMicroscope,
  faPersonChalkboard,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { CourseStaffInner } from '@polito/api-client/models';
import { MenuView } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetOfferingCourse } from '../../../core/queries/offeringHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
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
  const { courseShortcode, year: initialYear, teachingYear } = route.params;
  const styles = useStylesheet(createStyles);
  const { palettes, spacing, dark } = useTheme();
  const { t } = useTranslation();
  const [year, setYear] = useState(initialYear);
  const courseQuery = useGetOfferingCourse({
    courseShortcode,
    year,
  });
  const { isLoading } = courseQuery;
  const offeringCourse = courseQuery.data?.data;
  const { cfu, name, editions, shortcode } = offeringCourse || {};

  useEffect(() => {
    if (!courseQuery.isLoading) {
      setYear(offeringCourse?.editions[0] || initialYear);
    }
  }, [offeringCourse, courseQuery.isLoading]);

  console.debug('editions', editions);

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
          <Card padded>
            <Row justify="space-between">
              {!!editions && (
                <Col justify="flex-start" flex={1}>
                  <Text>{t('degreeCourseScreen.period')}</Text>
                  <View
                    importantForAccessibility="yes"
                    accessibilityRole="button"
                    accessible={true}
                  >
                    <MenuView
                      actions={editions?.map(edition => ({
                        id: edition.toString(),
                        title: edition,
                        state: edition === year ? 'on' : undefined,
                      }))}
                      onPressAction={async ({ nativeEvent: { event } }) => {
                        setYear(() => event);
                        await courseQuery.refetch();
                      }}
                    >
                      <Row align="center">
                        <Text variant="subHeading" style={styles.label}>
                          {teachingYear} - {year}
                        </Text>
                        <Icon
                          style={{
                            marginLeft: spacing[1],
                            marginTop: spacing[1],
                          }}
                          icon={faAngleDown}
                          color={palettes.secondary['500']}
                          size={12}
                        />
                      </Row>
                    </MenuView>
                  </View>
                </Col>
              )}
              {!!cfu && (
                <Col justify="flex-start" flex={1}>
                  <Text>{t('common.credits')}</Text>
                  <Text variant="subHeading" style={styles.label}>
                    {cfu} {t('common.cfu')}
                  </Text>
                </Col>
              )}
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
              linkTo={{
                screen: 'Staff',
                params: {
                  personIds: offeringCourse?.staff?.map(s => s.id) || [],
                },
              }}
            />
            <OverviewList>
              {offeringCourse?.staff.map(item => (
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
