import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { faSliders } from '@fortawesome/pro-regular-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useTabs } from '../../../core/hooks/useTabs';
import { CourseAssignmentsTab } from '../components/CourseAssignmentsTab';
import { CourseFilesTab } from '../components/CourseFilesTab';
import { CourseInfoTab } from '../components/CourseInfoTab';
import { CourseLecturesTab } from '../components/CourseLecturesTab';
import { CourseNoticesTab } from '../components/CourseNoticesTab';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { CourseContext } from '../contexts/CourseContext';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Course'>;

export type CourseTabProps = {
  courseId: number;
  navigation?: NativeStackNavigationProp<TeachingStackParamList, 'Course'>;
};

export const CourseScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const { id, courseName } = route.params;
  useScreenTitle(courseName);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={faSliders}
          color={colors.primary[400]}
          size={fontSizes.lg}
          adjustSpacing="right"
          accessibilityLabel={t('coursePreferencesScreen.title')}
          onPress={() => {
            navigation.navigate('CoursePreferences', { courseId: id });
          }}
        />
      ),
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: courseName,
      headerBackTitleVisible: courseName.length <= 20,
    });
  }, [courseName]);

  const { Tabs, TabsContent } = useTabs({
    tabs: [
      {
        title: t('courseInfoTab.title'),
        renderContent: () => <CourseInfoTab courseId={id} />,
      },
      {
        title: t('courseNoticesTab.title'),
        renderContent: () => <CourseNoticesTab courseId={id} />,
      },
      {
        title: t('courseFilesTab.title'),
        renderContent: () => (
          <CourseFilesTab courseId={id} navigation={navigation} />
        ),
      },
      {
        title: t('courseLecturesTab.title'),
        renderContent: () => (
          <CourseLecturesTab courseId={id} navigation={navigation} />
        ),
      },
      {
        title: t('courseAssignmentsTab.title'),
        renderContent: () => (
          <CourseAssignmentsTab courseId={id} navigation={navigation} />
        ),
      },
    ],
  });

  return (
    <CourseContext.Provider value={id}>
      <View style={{ flex: 1 }}>
        <Tabs />
        <TabsContent />
      </View>
    </CourseContext.Provider>
  );
};
