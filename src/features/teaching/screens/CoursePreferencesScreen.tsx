import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { stat, unlink } from 'react-native-fs';

import {
  faBell,
  faCircle,
  faEye,
  faFile,
} from '@fortawesome/free-regular-svg-icons';
import { faBroom, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { courseColors } from '../../../core/constants';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { formatFileSize } from '../../../utils/files';
import { CourseIcon } from '../components/CourseIcon';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { courseIcons } from '../constants';
import { CourseContext } from '../contexts/CourseContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

const CleanCourseFilesListItem = () => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const { fontSizes } = useTheme();
  const courseFilesCache = useCourseFilesCachePath();
  const [cacheSize, setCacheSize] = useState<number>(0);
  const confirm = useConfirmationDialog({
    title: t('common.areYouSure?'),
    message: t('coursePreferencesScreen.cleanCacheConfirmMessage'),
  });

  const refreshSize = () => {
    if (courseFilesCache) {
      stat(courseFilesCache)
        .then(({ size }) => {
          setCacheSize(size);
        })
        .catch(() => {
          setCacheSize(0);
        });
    }
  };

  useEffect(refreshSize, [courseFilesCache]);

  return (
    <ListItem
      isAction
      title={t('coursePreferencesScreen.cleanCourseFiles')}
      subtitle={t('coursePreferencesScreen.cleanCourseFilesSubtitle', {
        size: cacheSize == null ? '-- MB' : formatFileSize(cacheSize),
      })}
      disabled={cacheSize === 0}
      leadingItem={<Icon icon={faBroom} size={fontSizes['2xl']} />}
      onPress={async () => {
        if (courseFilesCache && (await confirm())) {
          unlink(courseFilesCache).then(() => {
            setFeedback({
              text: t('coursePreferencesScreen.cleanCacheFeedback'),
            });
            refreshSize();
          });
        }
      }}
    />
  );
};

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CoursePreferences'
>;

export const CoursePreferencesScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { spacing, fontSizes } = useTheme();
  const { courseId, uniqueShortcode } = route.params;
  const courseQuery = useGetCourse(courseId);
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const coursePrefs = useMemo(
    () => coursesPrefs[uniqueShortcode],
    [uniqueShortcode, coursesPrefs],
  );

  return (
    <CourseContext.Provider value={courseId}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl queries={[courseQuery]} />}
      >
        <SafeAreaView>
          <View style={{ paddingVertical: spacing[5] }}>
            <Section>
              <SectionHeader title={t('common.visualization')} />
              <OverviewList loading={courseQuery.isLoading} indented>
                <MenuView
                  actions={courseColors.map(cc => {
                    return {
                      id: cc.color,
                      title: t(cc.name),
                      image: Platform.select({
                        ios: 'circle.fill',
                        android: 'circle',
                      }),
                      imageColor: cc.color,
                      state: cc.color === coursePrefs?.color ? 'on' : undefined,
                    };
                  })}
                  onPressAction={({ nativeEvent: { event: color } }) => {
                    updatePreference('courses', {
                      ...coursesPrefs,
                      [uniqueShortcode]: {
                        ...coursePrefs,
                        color,
                      },
                    });
                  }}
                >
                  <ListItem
                    title={t('common.color')}
                    isAction
                    leadingItem={<CourseIcon color={coursePrefs?.color} />}
                  />
                </MenuView>
                <ListItem
                  title={t('common.icon')}
                  isAction
                  onPress={() =>
                    navigation.navigate('CourseIconPicker', {
                      courseId,
                      uniqueShortcode,
                    })
                  }
                  leadingItem={
                    <Icon
                      icon={
                        coursePrefs.icon && coursePrefs.icon in courseIcons
                          ? courseIcons[coursePrefs.icon]
                          : faCircle
                      }
                      size={fontSizes['2xl']}
                    />
                  }
                />
                <SwitchListItem
                  title={t('coursePreferencesScreen.showInExtracts')}
                  subtitle={t('coursePreferencesScreen.showInExtractsSubtitle')}
                  disabled={!coursePrefs}
                  value={!coursePrefs.isHidden}
                  leadingItem={<Icon icon={faEye} size={fontSizes['2xl']} />}
                  onChange={value => {
                    updatePreference('courses', {
                      ...coursesPrefs,
                      [uniqueShortcode]: {
                        ...coursePrefs,
                        isHidden: !value,
                      },
                    });
                  }}
                />
              </OverviewList>
            </Section>

            <Section>
              <SectionHeader title={t('common.notifications')} />
              <OverviewList indented>
                <SwitchListItem
                  title={t('common.notice_plural')}
                  subtitle={t('coursePreferencesScreen.noticesSubtitle')}
                  disabled={!courseQuery.data}
                  value={courseQuery.data?.notifications.avvisidoc}
                  leadingItem={<Icon icon={faBell} size={fontSizes['2xl']} />}
                  onChange={() => {
                    // TODO
                  }}
                />

                <SwitchListItem
                  title={t('common.file_plural')}
                  subtitle={t('coursePreferencesScreen.filesSubtitle')}
                  disabled={!courseQuery.data}
                  value={courseQuery.data?.notifications.matdid}
                  leadingItem={<Icon icon={faFile} size={fontSizes['2xl']} />}
                  onChange={() => {
                    // TODO
                  }}
                />

                <SwitchListItem
                  title={t('common.lecture_plural')}
                  subtitle={t('coursePreferencesScreen.lecturesSubtitle')}
                  disabled={!courseQuery.data}
                  value={courseQuery.data?.notifications.videolezioni}
                  leadingItem={
                    <Icon icon={faVideoCamera} size={fontSizes['2xl']} />
                  }
                  onChange={() => {
                    // TODO
                  }}
                />
              </OverviewList>
            </Section>

            <Section>
              <SectionHeader title={t('common.file_plural')} />
              <OverviewList indented>
                <CleanCourseFilesListItem />
              </OverviewList>
            </Section>
          </View>
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
    </CourseContext.Provider>
  );
};
