import { useEffect, useMemo } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseHideEvent'>;

export const CourseHideEventScreen = ({ navigation, route }: Props) => {
  const { fontSizes } = useTheme();
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const coursePrefs = useMemo(() => {
    return coursesPrefs[route.params.uniqueShortcode];
  }, [route.params.uniqueShortcode, coursesPrefs]);

  useEffect(() => {
    if (!coursePrefs.itemsToHideInAgenda?.length) {
      navigation.pop();
    }
  }, [coursePrefs.itemsToHideInAgenda, navigation]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <OverviewList>
          {coursesPrefs[route.params.uniqueShortcode].itemsToHideInAgenda?.map(
            (item, index) => (
              <ListItem
                key={index}
                title={DateTime.now()
                  .set({ weekday: item.day })
                  .toFormat('cccc')}
                subtitle={`${item.start}-${item.end}`}
                leadingItem={<Icon icon={faCalendar} size={fontSizes['2xl']} />}
                trailingItem={
                  <IconButton
                    icon={faX}
                    size={fontSizes.lg}
                    color="red"
                    onPress={() => {
                      updatePreference('courses', {
                        ...coursesPrefs,
                        [route.params.uniqueShortcode]: {
                          ...coursePrefs,
                          itemsToHideInAgenda: (
                            coursePrefs.itemsToHideInAgenda || []
                          ).filter(
                            recurrence =>
                              !(
                                recurrence.start === item.start &&
                                recurrence.end === item.end &&
                                recurrence.day === item.day &&
                                recurrence.room === item.room
                              ),
                          ),
                        },
                      });
                    }}
                  />
                }
              />
            ),
          )}
        </OverviewList>
      </SafeAreaView>
    </ScrollView>
  );
};
