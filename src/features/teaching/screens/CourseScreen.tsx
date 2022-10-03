import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useTabs } from '../../../core/hooks/useTabs';
import { CourseAssignmentsTab } from '../components/CourseAssignmentsTab';
import { CourseFilesTab } from '../components/CourseFilesTab';
import { CourseInfoTab } from '../components/CourseInfoTab';
import { CourseLecturesTab } from '../components/CourseLecturesTab';
import { CourseNoticesTab } from '../components/CourseNoticesTab';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Course'>;

export type CourseTabProps = {
  courseId: number;
};

export const CourseScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { id, courseName } = route.params;
  useScreenTitle(courseName);

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
