import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';
import { Tab } from '../../../lib/ui/components/Tab';
import { Tabs } from '../../../lib/ui/components/Tabs';
import { useTheme } from '../../../lib/ui/hooks/useTheme';
import { EmptyScreen } from '../../features/teaching/screens/EmptyScreen';
import { TeachingScreen } from '../../features/teaching/screens/TeachingScreen';
import { Header } from './Header';
import { TranslucentView } from './TranslucentView';

const TabsNav = createBottomTabNavigator();

export const MainNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const tabBarStyle: any = {
    position: Platform.select({ ios: 'absolute' }),
  };
  if (Platform.OS === 'ios') {
    tabBarStyle.height = 84;
  }

  return (
    <TabsNav.Navigator
      screenOptions={{
        tabBarStyle,
        tabBarBackground: Platform.select({
          ios: () => <TranslucentView />,
        }),
        header: ({ options, route }) => {
          const title = getHeaderTitle(options, route.name);
          return (
            <Header
              {...options}
              title={title}
              bottom={
                <Tabs selectedIndexes={[0]}>
                  <Tab>Info</Tab>
                  <Tab>Notices</Tab>
                  <Tab>Material</Tab>
                  <Tab>Homework</Tab>
                  <Tab>Homework</Tab>
                  <Tab>Homework</Tab>
                  <Tab>Homework</Tab>
                </Tabs>
              }
            />
          );
        },
        headerTitleStyle: { color: colors.heading },
        headerTransparent: true,
        headerBackground: Platform.select({
          ios: TranslucentView,
          android: ({ style }) => (
            <View style={[style, { backgroundColor: colors.surface }]} />
          ),
        }),
      }}
    >
      <TabsNav.Screen
        name="Teaching"
        component={TeachingScreen}
        options={{
          tabBarLabel: t('Teaching'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />
      <TabsNav.Screen
        name="Agenda"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Agenda'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <TabsNav.Screen
        name="Places"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Places'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" color={color} size={size} />
          ),
        }}
      />
      <TabsNav.Screen
        name="Profile"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </TabsNav.Navigator>
  );
};

export type TabsNavigatorParamList = {
  Teaching: undefined;
};
