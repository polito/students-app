import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useTabs } from '../../../core/hooks/useTabs';
import { CourseAssignmentsTab } from '../components/CourseAssignmentsTab';
import { CourseFilesTab } from '../components/CourseFilesTab';
import { CourseInfoTab } from '../components/CourseInfoTab';
import { CourseLecturesTab } from '../components/CourseLecturesTab';
import { CourseNoticesTab } from '../components/CourseNoticesTab';
import { CoursePreferencesMenu } from '../components/CoursePreferencesMenu';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Course'>;

export type CourseTabProps = {
  courseId: number;
  navigation?: NativeStackNavigationProp<TeachingStackParamList, 'Course'>;
};

export const CourseScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const { courses } = useContext(PreferencesContext);
  const { id, courseName } = route.params;

  navigation.setOptions({
    headerRight: () => (
      <CoursePreferencesMenu courseId={id} title={t('Course preferences')}>
        <TouchableOpacity>
          <Ionicons
            name={Platform.select({
              ios: 'ellipsis-horizontal-circle-outline',
              android: 'ellipsis-vertical-outline',
            })}
            color={colors.primary[400]}
            size={fontSizes['2xl']}
          />
        </TouchableOpacity>
      </CoursePreferencesMenu>
    ),
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: courseName,
      headerBackTitleVisible: courseName.length <= 20,
    });
  }, [courseName]);

  const { Tabs, TabsContent } = useTabs([
    {
      title: t('Info'),
      renderContent: () => <CourseInfoTab courseId={id} />,
    },
    {
      title: t('Notices'),
      renderContent: () => <CourseNoticesTab courseId={id} />,
    },
    {
      title: t('Files'),
      renderContent: () => (
        <CourseFilesTab courseId={id} navigation={navigation} />
      ),
    },
    {
      title: t('Lectures'),
      renderContent: () => (
        <CourseLecturesTab courseId={id} navigation={navigation} />
      ),
    },
    {
      title: t('Assignments'),
      renderContent: () => (
        <CourseAssignmentsTab courseId={id} navigation={navigation} />
      ),
    },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs />
      <TabsContent />
    </View>
  );
};
