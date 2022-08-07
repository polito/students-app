import { useTranslation } from 'react-i18next';
import { Animated, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';
import { useTheme } from '../../../lib/ui/hooks/useTheme';
import { EmptyScreen } from '../../features/teaching/screens/EmptyScreen';
import { TeachingScreen } from '../../features/teaching/screens/TeachingScreen';
import { Header } from './Header';
import { TranslucentView } from './TranslucentView';

import AnimatedValue = Animated.AnimatedValue;

const Tabs = createBottomTabNavigator();
const scrollTop = new Animated.Value(0);

export const MainNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarStyle: Platform.select({ ios: { position: 'absolute' } }),
        tabBarBackground: Platform.select({
          ios: () => <TranslucentView />,
        }),
        header: ({ options, route }) => {
          const title = getHeaderTitle(options, route.name);
          return <Header {...options} title={title} scrollTop={scrollTop} />;
        },
        headerTransparent: true,
        headerBackground: Platform.select({
          ios: TranslucentView,
          android: ({ style }) => (
            <View style={[style, { backgroundColor: colors.surface }]} />
          ),
        }),
      }}
    >
      <Tabs.Screen
        name="Teaching"
        component={TeachingScreen}
        initialParams={{ scrollTop }}
        options={{
          tabBarLabel: t('Teaching'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Agenda"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Agenda'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Places"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Places'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

export type TabsNavigatorParamList = {
  Teaching: {
    scrollTop?: AnimatedValue;
  };
};
