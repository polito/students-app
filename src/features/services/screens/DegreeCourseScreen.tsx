import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import {
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
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetOfferingCourse } from '../../../core/queries/offeringHooks';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'DegreeCourse'>;
const listTitleProps = { numberOfLines: 4 };
export const DegreeCourseScreen = ({ route }: Props) => {
  const { courseShortcode, year } = route.params;
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const courseQuery = useGetOfferingCourse({ courseShortcode, year });
  const { isLoading } = courseQuery;
  const offeringCourse = courseQuery.data?.data;
  const { cfu, name, editions, shortcode } = offeringCourse || {};

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
                  <Text variant="subHeading" style={styles.label}>
                    {editions?.toString()}
                  </Text>
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
                title={offeringCourse?.hours?.lecture?.toString()}
                titleStyle={styles.title}
                titleProps={listTitleProps}
                subtitle={t('degreeCourseScreen.lecture')}
                leadingItem={<Icon size={20} icon={faBriefcase} />}
              />
            )}
            {!!offeringCourse?.hours?.classroomExercise && (
              <ListItem
                inverted
                title={offeringCourse?.hours?.classroomExercise?.toString()}
                titleStyle={styles.title}
                titleProps={listTitleProps}
                subtitle={t('degreeCourseScreen.classroomExercise')}
                leadingItem={<Icon size={20} icon={faMicroscope} />}
              />
            )}
            {!!offeringCourse?.hours?.labExercise && (
              <ListItem
                inverted
                title={offeringCourse?.hours?.labExercise?.toString()}
                titleStyle={styles.title}
                titleProps={listTitleProps}
                subtitle={t('degreeCourseScreen.labExercise')}
                leadingItem={<Icon size={20} icon={faFlaskVial} />}
              />
            )}
            {!!offeringCourse?.hours?.tutoring && (
              <ListItem
                inverted
                title={offeringCourse?.hours?.tutoring?.toString()}
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
              linkTo={{ screen: 'staff' }}
              linkToMoreCount={offeringCourse?.staff.length}
            />
            <OverviewList>
              {offeringCourse?.staff.map(s => (
                <ListItem key={s.id} title={s.role} />
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
