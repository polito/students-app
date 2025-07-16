import { useTranslation } from 'react-i18next';

import { OfferingCourseStaff } from '@polito/api-client/models';
import {
  ParamListBase,
  StackNavigationState,
  TypedNavigator,
} from '@react-navigation/native';
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../core/components/HeaderLogo';
import { DegreeCourseGuideScreen } from '../../features/offering/screens/DegreeCourseGuideScreen';
import { DegreeCourseScreen } from '../../features/offering/screens/DegreeCourseScreen';
import { StaffScreen } from '../../features/offering/screens/StaffScreen';
import { PersonScreen } from '../../features/people/screens/PersonScreen';
import { ImageScreen } from '../../features/tickets/components/ImageScreen';
import { UnreadMessagesModal } from '../../features/user/screens/UnreadMessagesModal';

export interface SharedScreensParamList extends ParamListBase {
  Person: { id: number };
  DegreeCourse: {
    courseShortcode: string;
    year?: string;
  };
  DegreeCourseGuide: {
    courseShortcode: string;
    year?: string;
  };
  Staff: {
    courseShortcode: string;
    year?: string;
    staff: OfferingCourseStaff[];
  };
  MessagesModal: undefined;
  ImageScreen: {
    uri: string;
    width: number;
    height: number;
  };
}
export const SharedScreens = (
  Stack: TypedNavigator<
    SharedScreensParamList,
    StackNavigationState<ParamListBase>,
    NativeStackNavigationOptions,
    NativeStackNavigationEventMap,
    any
  >,
) => {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        name="Staff"
        component={StaffScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
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
        name="MfaModal"
        component={UnreadMessagesModal}
        options={{
          headerTitle: t('mfaScreen.title'),
          headerLargeTitle: false,
          presentation: 'modal',
          headerLeft: () => <HeaderLogo />,
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <Stack.Screen
        name="ImageScreen"
        component={ImageScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.image'),
          headerBackTitleVisible: false,
        }}
      />
    </>
  );
};
