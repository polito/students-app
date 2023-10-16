import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View, useWindowDimensions } from 'react-native';

import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  MaterialTopTabBarProps,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { usePushNotifications } from '../../../core/hooks/usePushNotifications';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { CourseContext } from '../contexts/CourseContext';
import { FilesCacheProvider } from '../providers/FilesCacheProvider';
import { CourseAssignmentsScreen } from '../screens/CourseAssignmentsScreen';
import { CourseFilesScreen } from '../screens/CourseFilesScreen';
import { CourseInfoScreen } from '../screens/CourseInfoScreen';
import { CourseLecturesScreen } from '../screens/CourseLecturesScreen';
import { CourseNoticesScreen } from '../screens/CourseNoticesScreen';
import { CourseIndicator } from './CourseIndicator';
import { TeachingStackParamList } from './TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Course'>;

export interface CourseTabsParamList extends TeachingStackParamList {
  CourseInfoScreen: undefined;
  CourseNoticesScreen: undefined;
  CourseFilesScreen: undefined;
  CourseLecturesScreen: undefined;
  CourseAssignmentsScreen: undefined;
}

const TopTabs = createMaterialTopTabNavigator<CourseTabsParamList>();

const TabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
  return (
    <HeaderAccessory>
      <Tabs>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate({
                name: route.name,
                merge: true,
                params: {},
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Tab
              key={route.key}
              selected={isFocused}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              badge={options.tabBarBadge as unknown as string}
            >
              {label as string}
            </Tab>
          );
        })}
      </Tabs>
    </HeaderAccessory>
  );
};

export const CourseNavigator = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { palettes, fontSizes, spacing } = theme;
  const { width } = useWindowDimensions();
  const { getUnreadsCount } = usePushNotifications();
  const titleStyles = useTitlesStyles(theme);
  const { id, courseName } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
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
            navigation.navigate('CoursePreferences', { courseId: id });
          }}
        />
      ),
    });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            left: Platform.select({ android: -20 }),
          }}
        >
          <CourseIndicator courseId={id} />
          <Text
            variant="title"
            style={[
              {
                marginLeft: spacing[2],
                maxWidth: width - 180,
              },
              titleStyles.headerTitleStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {courseName}
          </Text>
        </View>
      ),
    });
  }, [
    courseName,
    width,
    id,
    navigation,
    spacing,
    titleStyles.headerTitleStyle,
  ]);

  return (
    <CourseContext.Provider value={id}>
      <FilesCacheProvider>
        <TopTabs.Navigator tabBar={props => <TabBar {...props} />}>
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
              tabBarBadge: getUnreadsCount([
                'teaching',
                'courses',
                id.toString(),
                'notices',
              ]) as unknown as MaterialTopTabNavigationOptions['tabBarBadge'],
            }}
          />
          <TopTabs.Screen
            name="CourseFilesScreen"
            component={CourseFilesScreen}
            options={{
              title: t('courseFilesTab.title'),
              tabBarBadge: getUnreadsCount([
                'teaching',
                'courses',
                id.toString(),
                'files',
              ]) as unknown as MaterialTopTabNavigationOptions['tabBarBadge'],
            }}
          />
          <TopTabs.Screen
            name="CourseLecturesScreen"
            component={CourseLecturesScreen}
            options={{
              title: t('courseLecturesTab.title'),
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
      </FilesCacheProvider>
    </CourseContext.Provider>
  );
};
