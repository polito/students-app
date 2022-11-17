import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
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
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { courseColors } from '../../../core/constants';
import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { formatFileSize } from '../../../utils/files';
import { CourseIcon } from '../components/CourseIcon';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { courseIcons } from '../constants';
import { CourseContext } from '../contexts/CourseContext';
import { useCourseFilesCache } from '../hooks/useCourseFilesCache';

const CleanCourseFilesListItem = () => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const courseFilesCache = useCourseFilesCache();
  const [cacheSize, setCacheSize] = useState<number>(null);
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
      isNavigationAction
      title={t('coursePreferencesScreen.cleanCourseFiles')}
      subtitle={t('coursePreferencesScreen.cleanCourseFilesSubtitle', {
        size: cacheSize == null ? '-- MB' : formatFileSize(cacheSize),
      })}
      disabled={cacheSize === 0}
      leadingItem={<Icon icon={faBroom} size={fontSizes['2xl']} />}
      onPress={async () => {
        if (courseFilesCache && (await confirm())) {
          await unlink(courseFilesCache);
          refreshSize();
          // TODO feedback
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
  const { spacing, colors, fontSizes } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const { courseId } = route.params;
  const courseQuery = useGetCourse(courseId);
  const { courses: coursesPrefs, updatePreference } =
    useContext(PreferencesContext);
  const coursePrefs = useMemo(
    () => coursesPrefs[courseId],
    [courseId, coursesPrefs],
  );

  return (
    <CourseContext.Provider value={courseId}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={createRefreshControl(courseQuery)}
        contentContainerStyle={bottomBarAwareStyles}
      >
        <View style={{ paddingVertical: spacing[5] }}>
          <Section>
            <SectionHeader title={t('common.visualization')} />
            <SectionList loading={courseQuery.isLoading} indented>
              <MenuView
                actions={courseColors.map(cc => {
                  return {
                    id: cc.color,
                    title: cc.name,
                    image: 'circle.fill',
                    imageColor: cc.color,
                  };
                })}
                onPressAction={({ nativeEvent: { event: color } }) => {
                  updatePreference('courses', {
                    ...coursesPrefs,
                    [courseId]: {
                      ...coursePrefs,
                      color,
                    },
                  });
                }}
              >
                <ListItem
                  title={t('common.color')}
                  isNavigationAction
                  leadingItem={<CourseIcon color={coursePrefs?.color} />}
                />
              </MenuView>
              <ListItem
                title={t('common.icon')}
                isNavigationAction
                onPress={() =>
                  navigation.navigate('CourseIconPicker', { courseId })
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
                    [courseId]: {
                      ...coursePrefs,
                      isHidden: !value,
                    },
                  });
                }}
              />
            </SectionList>
          </Section>

          <Section>
            <SectionHeader title={t('common.notifications')} />
            <SectionList indented>
              <SwitchListItem
                title={t('common.notice', { count: 2 })}
                subtitle={t('coursePreferencesScreen.noticesSubtitle')}
                disabled={!courseQuery.data}
                value={courseQuery.data?.data.notifications.avvisidoc}
                leadingItem={<Icon icon={faBell} size={fontSizes['2xl']} />}
                onChange={value => {
                  // TODO
                }}
              />

              <SwitchListItem
                title={t('common.file', { count: 2 })}
                subtitle={t('coursePreferencesScreen.filesSubtitle')}
                disabled={!courseQuery.data}
                value={courseQuery.data?.data.notifications.matdid}
                leadingItem={<Icon icon={faFile} size={fontSizes['2xl']} />}
                onChange={value => {
                  // TODO
                }}
              />

              <SwitchListItem
                title={t('common.lecture', { count: 2 })}
                subtitle={t('coursePreferencesScreen.lecturesSubtitle')}
                disabled={!courseQuery.data}
                value={courseQuery.data?.data.notifications.videolezioni}
                leadingItem={
                  <Icon icon={faVideoCamera} size={fontSizes['2xl']} />
                }
                onChange={value => {
                  // TODO
                }}
              />
            </SectionList>
          </Section>

          <Section>
            <SectionHeader title={t('common.file', { count: 2 })} />
            <SectionList indented>
              <CleanCourseFilesListItem />
            </SectionList>
          </Section>
        </View>
      </ScrollView>
    </CourseContext.Provider>
  );
};
