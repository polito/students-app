import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View, useWindowDimensions } from 'react-native';

import { faSliders } from '@fortawesome/free-solid-svg-icons';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { titlesStyles } from '@core/hooks/titlesStyles';
import { useTabs } from '@core/hooks/useTabs';
import { GlobalStyles } from '@core/styles/globalStyles';

import { IconButton } from '@lib/ui/components/IconButton';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { CourseAssignmentsTab } from '../components/CourseAssignmentsTab';
import { CourseFilesTab } from '../components/CourseFilesTab';
import { CourseIndicator } from '../components/CourseIndicator';
import { CourseInfoTab } from '../components/CourseInfoTab';
import { CourseLecturesTab } from '../components/CourseLecturesTab';
import { CourseNoticesTab } from '../components/CourseNoticesTab';
import { CourseContext } from '../contexts/CourseContext';
import { FilesCacheProvider } from '../providers/FilesCacheProvider';
import { CoursesStackParamList } from './createCoursesScreens';

type Props = NativeStackScreenProps<CoursesStackParamList, 'Course'>;

export type CourseTabProps = {
  courseId: number;
  navigation?: NativeStackNavigationProp<CoursesStackParamList, 'Course'>;
};

export const Course = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { palettes, fontSizes, spacing } = theme;
  const { width } = useWindowDimensions();

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
            navigation.navigate('Preferences', { courseId: id });
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
              titlesStyles(theme).headerTitleStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {courseName}
          </Text>
        </View>
      ),
    });
  }, [courseName]);

  const { Tabs, TabsContent } = useTabs([
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
  ]);

  return (
    <CourseContext.Provider value={id}>
      <FilesCacheProvider>
        <View style={GlobalStyles.grow} accessible={false}>
          <Tabs />
          <TabsContent />
        </View>
      </FilesCacheProvider>
    </CourseContext.Provider>
  );
};
