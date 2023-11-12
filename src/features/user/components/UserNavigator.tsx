import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { DegreeTopTabsNavigator } from '../../offering/navigation/DegreeTopTabsNavigator';
import { DegreeCourseGuideScreen } from '../../offering/screens/DegreeCourseGuideScreen';
import { DegreeCourseScreen } from '../../offering/screens/DegreeCourseScreen';
import { StaffScreen } from '../../offering/screens/StaffScreen';
import { PersonScreen } from '../../people/screens/PersonScreen';
import { OfferingStackParamList } from '../../services/components/ServicesNavigator';
import { MessageScreen } from '../screens/MessageScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UnreadMessagesModal } from '../screens/UnreadMessagesModal';

export type UserStackParamList = OfferingStackParamList & {
  Profile: undefined;
  Settings: undefined;
  Messages: undefined;
  Message: {
    id: number;
  };
  MessagesModal: undefined;
  Person: { id: number };
};
const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      id="UserTabNavigator"
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        headerBlurEffect: 'systemUltraThinMaterial',
        ...useTitlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('profileScreen.title'),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: t('settingsScreen.title'),
        }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          headerTitle: t('messagesScreen.title'),
        }}
      />
      <Stack.Screen
        name="Message"
        component={MessageScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerTitle: t('messageScreen.title'),
          headerBackTitle: t('messageScreen.backTitle'),
        }}
      />
      <Stack.Screen
        name="MessagesModal"
        component={UnreadMessagesModal}
        options={{
          headerTitle: t('messagesScreen.title'),
          headerLargeTitle: false,
          presentation: 'modal',
          headerLeft: () => <HeaderLogo />,
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <Stack.Screen
        name="Degree"
        component={DegreeTopTabsNavigator}
        getId={({ params: { id, year } }) => id + (year ?? '0')}
        options={{
          headerTitle: t('degreeScreen.title'),
          headerLargeTitle: false,
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
        }}
      />
      <Stack.Screen
        name="DegreeCourse"
        component={DegreeCourseScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
        options={{
          headerTitle: t('degreeCourseScreen.title'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="DegreeCourseGuide"
        component={DegreeCourseGuideScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Person"
        component={PersonScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.contact'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Staff"
        component={StaffScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
      />
    </Stack.Navigator>
  );
};
