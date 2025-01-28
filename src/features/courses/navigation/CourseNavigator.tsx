import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, useWindowDimensions } from 'react-native';

import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TopTabBar } from '@lib/ui/components/TopTabBar';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useNotifications } from '../../../core/hooks/useNotifications';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseIndicator } from '../components/CourseIndicator';
import { CourseContext } from '../contexts/CourseContext';
import { CourseFilesCacheProvider } from '../providers/CourseFilesCacheProvider';
import { CourseAssignmentsScreen } from '../screens/CourseAssignmentsScreen';
import { CourseInfoScreen } from '../screens/CourseInfoScreen';
import { CourseLecturesScreen } from '../screens/CourseLecturesScreen';
import { CourseNoticesScreen } from '../screens/CourseNoticesScreen';
import { FileNavigator } from './FileNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Course'>;

export interface CourseTabsParamList extends TeachingStackParamList {
  CourseInfoScreen: undefined;
  CourseNoticesScreen: undefined;
  CourseFilesScreen: undefined;
  CourseLecturesScreen: undefined;
  CourseAssignmentsScreen: undefined;
}

const TopTabs = createMaterialTopTabNavigator<CourseTabsParamList>();

export const CourseNavigator = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { palettes, fontSizes, spacing } = theme;
  const { width } = useWindowDimensions();
  const { getUnreadsCount } = useNotifications();
  const titleStyles = useTitlesStyles(theme);

  const { id } = route.params;

  const coursesQuery = useGetCourses();

  useEffect(() => {
    if (!coursesQuery.data) return;
    const course = coursesQuery.data.find(
      c => c.id === id || c.previousEditions.some(e => e.id === id),
    );
    if (!course) return;

    navigation.setOptions({
      headerTitle: () => (
        <Row
          align="center"
          justify="space-between"
          style={{
            width: Platform.select({ android: width - 50, ios: width - 40 }),
            left: Platform.select({ android: -25, ios: -15 }),
          }}
        >
          <Row gap={2} align="center" flexShrink={1}>
            <CourseIndicator uniqueShortcode={course.uniqueShortcode} />
            <Text
              variant="title"
              style={[
                titleStyles.headerTitleStyle,
                {
                  fontSize: 17,
                  flexShrink: 1,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {course.name}
            </Text>
          </Row>
          <IconButton
            icon={faSliders}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            accessibilityRole="button"
            accessibilityLabel={t('common.preferences')}
            hitSlop={{
              left: +spacing[3],
              right: +spacing[3],
            }}
            onPress={() => {
              navigation.navigate('CoursePreferences', {
                courseId: id,
                uniqueShortcode: course.uniqueShortcode,
              });
            }}
          />
        </Row>
      ),
    });
  }, [
    coursesQuery.data,
    fontSizes.lg,
    id,
    navigation,
    palettes.primary,
    spacing,
    t,
    titleStyles.headerTitleStyle,
    width,
  ]);

  return (
    <CourseContext.Provider value={id}>
      <CourseFilesCacheProvider>
        <TopTabs.Navigator tabBar={props => <TopTabBar {...props} />}>
          <TopTabs.Screen
            name="CourseInfoScreen"
            component={CourseInfoScreen}
            options={{
              title: t('courseInfoTab.title'),
            }}
          />
          <TopTabs.Screen
            name="CourseNoticesScreen"
            component={CourseNoticesScreen}
            options={{
              title: t('courseNoticesTab.title'),
              tabBarBadge: () =>
                getUnreadsCount([
                  'teaching',
                  'courses',
                  id.toString(),
                  'notices',
                ]),
            }}
          />
          <TopTabs.Screen
            name="CourseFilesScreen"
            component={FileNavigator}
            options={{
              title: t('courseFilesTab.title'),
              tabBarBadge: () =>
                getUnreadsCount([
                  'teaching',
                  'courses',
                  id.toString(),
                  'files',
                ]),
            }}
          />
          <TopTabs.Screen
            name="CourseLecturesScreen"
            component={CourseLecturesScreen}
            options={{
              title: t('courseLecturesTab.title'),
              tabBarBadge: () =>
                getUnreadsCount([
                  'teaching',
                  'courses',
                  id.toString(),
                  'lectures',
                ]),
            }}
          />
          <TopTabs.Screen
            name="CourseAssignmentsScreen"
            component={CourseAssignmentsScreen}
            options={{
              title: t('courseAssignmentsTab.title'),
            }}
          />
        </TopTabs.Navigator>
      </CourseFilesCacheProvider>
    </CourseContext.Provider>
  );
};
