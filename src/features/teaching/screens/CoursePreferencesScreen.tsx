import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Switch, View } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { CourseIcon } from '../components/CourseIcon';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CoursePreferences'
>;

export const CoursePreferencesScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const { courseId } = route.params;
  const courseQuery = useGetCourse(courseId);
  const { courses: coursesPrefs, updatePreference } =
    useContext(PreferencesContext);
  const coursePrefs = useMemo(
    () => coursesPrefs[courseId],
    [courseId, coursesPrefs],
  );
  const courseColors = useMemo(
    () => [
      { name: 'Dark blue', color: colors.darkBlue[400] },
      { name: 'Orange', color: colors.orange[400] },
      { name: 'Rose', color: colors.rose[400] },
      { name: 'Red', color: colors.red[400] },
      { name: 'Green', color: colors.green[400] },
      { name: 'Dark orange', color: colors.darkOrange[400] },
      { name: 'Light blue', color: colors.lightBlue[400] },
    ],
    [colors],
  );

  return (
    <ScrollView refreshControl={createRefreshControl(courseQuery)}>
      <View style={{ paddingVertical: spacing[5] }}>
        <Section>
          <SectionHeader title={t('Visualization')} />
          <SectionList loading={courseQuery.isLoading}>
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
                title={t('Color')}
                leadingItem={<CourseIcon color={coursePrefs?.color} />}
                onPress={() => {}}
              />
            </MenuView>
            <ListItem title={t('Icon')} />
            <SwitchListItem
              title={t('Show in home screen')}
              value={!coursePrefs.isHidden}
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
          <SectionHeader title={t('Notifications')} />
          <SectionList>
            <ListItem
              title={t('Notices')}
              onPress={() => {
                // TODO
              }}
              trailingItem={
                <Switch value={courseQuery.data.data.notifications.avvisidoc} />
              }
            />
            <ListItem
              title={t('Files')}
              onPress={() => {
                // TODO
              }}
              trailingItem={
                <Switch value={courseQuery.data.data.notifications.matdid} />
              }
            />
            <ListItem
              title={t('Lessons')}
              onPress={() => {
                // TODO
              }}
              trailingItem={
                <Switch
                  value={courseQuery.data.data.notifications.videolezioni}
                />
              }
            />
          </SectionList>
        </Section>
      </View>
    </ScrollView>
  );
};
