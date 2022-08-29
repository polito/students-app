import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTabs } from '../../../core/hooks/useTabs';
import { CourseAssignmentsTab } from '../components/CourseAssignmentsTab';
import { CourseFilesTab } from '../components/CourseFilesTab';
import { CourseInfoTab } from '../components/CourseInfoTab';
import { CourseLecturesTab } from '../components/CourseLecturesTab';
import { CourseNoticesTab } from '../components/CourseNoticesTab';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { useGetCourse } from '../hooks/courseHooks';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Course'>;

export type CourseTabProps = {
  courseId: number;
};

export const CourseScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { id, courseName } = route.params;
  const { setOptions } = useNavigation();
  const { data: overviewResponse } = useGetCourse(id);

  if (courseName) {
    setOptions({
      headerTitle: courseName,
    });
  }

  useEffect(() => {
    const headerTitle = courseName || overviewResponse?.data.name;
    setOptions({
      headerTitle,
      headerBackTitleVisible: headerTitle.length <= 20,
    });
  }, [courseName, overviewResponse]);

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
      renderContent: () => <CourseFilesTab courseId={id} />,
    },
    {
      title: t('Lectures'),
      renderContent: () => <CourseLecturesTab courseId={id} />,
    },
    {
      title: t('Assignments'),
      renderContent: () => <CourseAssignmentsTab courseId={id} />,
    },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs />
      <TabsContent />
    </View>
  );
};
