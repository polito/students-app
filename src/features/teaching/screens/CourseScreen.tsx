import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SubHeader } from '../../../core/components/SubHeader';
import { useSubHeader } from '../../../core/hooks/useSubHeader';
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
  setIsRefreshing: (value: boolean) => void;
  shouldRefresh: boolean;
};

export const CourseScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { id, courseName } = route.params;
  const { setOptions } = useNavigation();
  const { subHeaderProps, scrollViewProps } = useSubHeader();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const { data: overviewResponse } = useGetCourse(id);

  useEffect(() => {
    const headerTitle = courseName || overviewResponse?.data.name;
    setOptions({
      headerTitle,
      headerBackTitleVisible: headerTitle.length <= 20,
    });
  }, [courseName, overviewResponse]);

  useEffect(() => {
    if (!isRefreshing) {
      setShouldRefresh(false);
    }
  }, [isRefreshing]);

  const refreshControlProps = {
    setIsRefreshing,
    shouldRefresh,
  };

  const { Tabs, TabsContent } = useTabs([
    {
      title: t('Info'),
      renderContent: () => (
        <CourseInfoTab courseId={id} {...refreshControlProps} />
      ),
    },
    {
      title: t('Notices'),
      renderContent: () => (
        <CourseNoticesTab courseId={id} {...refreshControlProps} />
      ),
    },
    {
      title: t('Files'),
      renderContent: () => (
        <CourseFilesTab courseId={id} {...refreshControlProps} />
      ),
    },
    {
      title: t('Lectures'),
      renderContent: () => (
        <CourseLecturesTab courseId={id} {...refreshControlProps} />
      ),
    },
    {
      title: t('Assignments'),
      renderContent: () => (
        <CourseAssignmentsTab courseId={id} {...refreshControlProps} />
      ),
    },
  ]);

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => setShouldRefresh(true)}
        />
      }
    >
      <SubHeader {...subHeaderProps}>
        <Tabs />
      </SubHeader>
      <TabsContent />
    </ScrollView>
  );
};
