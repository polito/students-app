import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  FlatList,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  faBell,
  faChevronDown,
  faChevronUp,
  faEye,
  faFile,
  faVideoCamera,
} from '@fortawesome/pro-regular-svg-icons';
import { faCircleDashed } from '@fortawesome/pro-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
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
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { CourseIcon } from '../components/CourseIcon';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { courseIcons } from '../constants';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CoursePreferences'
>;

const iconsSelectorHeight = new Animated.Value(56);

export const CoursePreferencesScreen = ({ route }: Props) => {
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
  const [selectingIcon, setSelectingIcon] = useState(false);
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

  useEffect(() => {
    Animated.timing(iconsSelectorHeight, {
      duration: 100,
      toValue: selectingIcon ? 300 : 56,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [selectingIcon]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={createRefreshControl(courseQuery)}
      contentContainerStyle={bottomBarAwareStyles}
    >
      <View style={{ paddingVertical: spacing[5] }}>
        <Section>
          <SectionHeader title={t('Visualization')} />
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
                title={t('Color')}
                isNavigationAction
                leadingItem={<CourseIcon color={coursePrefs?.color} />}
              />
            </MenuView>
            <Animated.View
              style={{
                height: iconsSelectorHeight,
              }}
            >
              <ListItem
                title={t('Icon')}
                onPress={() => setSelectingIcon(old => !old)}
                leadingItem={
                  <Icon
                    icon={
                      coursePrefs.icon
                        ? courseIcons[coursePrefs.icon]
                        : faCircleDashed
                    }
                    size={fontSizes['2xl']}
                  />
                }
                trailingItem={
                  <Icon
                    icon={selectingIcon ? faChevronUp : faChevronDown}
                    color={colors.secondaryText}
                  />
                }
              />
              <FlatList
                style={{ flex: 1 }}
                data={Object.entries(courseIcons)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ flex: 1, padding: spacing[4] }}
                    onPress={() => {
                      updatePreference('courses', {
                        ...coursesPrefs,
                        [courseId]: {
                          ...coursePrefs,
                          icon: item[0],
                        },
                      });
                      setSelectingIcon(false);
                    }}
                  >
                    <Icon icon={item[1]} size={fontSizes['2xl']} />
                  </TouchableOpacity>
                )}
                numColumns={5}
                contentContainerStyle={{ paddingHorizontal: spacing[5] }}
              />
            </Animated.View>
            <SwitchListItem
              title={t('Show in home screen')}
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
          <SectionHeader title={t('Notifications')} />
          <SectionList indented>
            <ListItem
              title={t('Notices')}
              subtitle={t('coursePreferencesScreen.noticesSubtitle')}
              onPress={() => {
                // TODO
              }}
              leadingItem={<Icon icon={faBell} size={fontSizes['2xl']} />}
              trailingItem={
                <Switch
                  value={courseQuery.data?.data.notifications.avvisidoc}
                />
              }
            />
            <ListItem
              title={t('Files')}
              subtitle={t('coursePreferencesScreen.filesSubtitle')}
              onPress={() => {
                // TODO
              }}
              leadingItem={<Icon icon={faFile} size={fontSizes['2xl']} />}
              trailingItem={
                <Switch value={courseQuery.data?.data.notifications.matdid} />
              }
            />
            <ListItem
              title={t('Lessons')}
              subtitle={t('coursePreferencesScreen.lessonsSubtitle')}
              onPress={() => {
                // TODO
              }}
              leadingItem={
                <Icon icon={faVideoCamera} size={fontSizes['2xl']} />
              }
              trailingItem={
                <Switch
                  value={courseQuery.data.data?.notifications.videolezioni}
                />
              }
            />
          </SectionList>
        </Section>
      </View>
    </ScrollView>
  );
};
