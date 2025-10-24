import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { Icon } from '@lib/ui/components/Icon';
import { Metric } from '@lib/ui/components/Metric';
import { Row } from '@lib/ui/components/Row';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { GlobalStyles } from '~/core/styles/GlobalStyles.ts';

import { StatisticsFilters } from '../utils/computeStatisticsFilters';

export enum CourseStatisticsFilterType {
  TEACHER = 'teacher',
  YEAR = 'year',
  DEFAULT = 'default',
}

export const CourseStatisticsFilters = ({
  teachers,
  years,
  onTeacherChanged,
  onYearChanged,
  currentYear,
  currentTeacher,
  filterType = CourseStatisticsFilterType.DEFAULT,
}: StatisticsFilters & {
  onTeacherChanged: (teacherId: string) => void;
  onYearChanged: (year: string) => void;
  filterType?: CourseStatisticsFilterType;
}) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  return (
    <Card style={styles.metricsCard} accessible={true}>
      <Grid>
        <View style={GlobalStyles.grow}>
          {(filterType === CourseStatisticsFilterType.YEAR ||
            filterType === CourseStatisticsFilterType.DEFAULT) &&
          years.length > 1 ? (
            <StatefulMenuView
              onPressAction={({ nativeEvent }) => {
                onYearChanged(nativeEvent.event);
              }}
              actions={years}
            >
              <Row justify="flex-start" align="center">
                <Metric
                  title={t('courseStatisticsScreen.period')}
                  value={currentYear?.title ?? '--'}
                  accessibilityLabel={`${t('courseStatisticsScreen.period')}: ${
                    currentYear?.title ?? '--'
                  }`}
                  valueStyle={styles.dropdownText}
                />
                <Icon icon={faChevronDown} style={styles.chevronStyle} />
              </Row>
            </StatefulMenuView>
          ) : (
            <Row>
              <Metric
                title={t('courseStatisticsScreen.period')}
                value={currentYear?.title ?? '--'}
                accessibilityLabel={`${t('courseStatisticsScreen.period')}: ${
                  currentYear?.title ?? '--'
                }`}
                valueStyle={styles.dropdownText}
              />
            </Row>
          )}
        </View>
        <View style={GlobalStyles.grow}>
          {filterType === CourseStatisticsFilterType.TEACHER ||
          filterType === CourseStatisticsFilterType.DEFAULT ? (
            <StatefulMenuView
              onPressAction={({ nativeEvent }) => {
                onTeacherChanged(nativeEvent.event);
              }}
              actions={teachers}
            >
              <Row style={{ alignItems: 'center' }}>
                <Metric
                  title={t('courseStatisticsScreen.teacher')}
                  value={currentTeacher?.title ?? '--'}
                  accessibilityLabel={`${t('courseStatisticsScreen.teacher')}: ${
                    currentTeacher?.title ?? '--'
                  }`}
                  valueStyle={styles.dropdownText}
                />
                <Icon
                  icon={faChevronDown}
                  style={[styles.chevronStyle, { flexShrink: 0 }]}
                />
              </Row>
            </StatefulMenuView>
          ) : (
            <Row>
              <Metric
                title={t('courseStatisticsScreen.teacher')}
                value={currentTeacher?.title ?? '--'}
                accessibilityLabel={`${t('courseStatisticsScreen.teacher')}: ${
                  currentTeacher?.title ?? '--'
                }`}
                valueStyle={styles.dropdownText}
              />
            </Row>
          )}
        </View>
      </Grid>
    </Card>
  );
};

const createStyles = ({ spacing, fontSizes, palettes }: Theme) =>
  StyleSheet.create({
    metricsCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      marginTop: spacing[0],
      marginBottom: spacing[5],
    },
    dropdownText: {
      color: palettes.text['800'],
      fontSize: fontSizes.lg,
    },
    chevronStyle: {
      marginLeft: spacing[2],
      marginTop: spacing[5],
    },
  });
