import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, TouchableOpacity } from 'react-native';

import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import {
  PreferencesContextBase,
  usePreferencesContext,
} from '../../../core/contexts/PreferencesContext';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { courseIcons } from '../constants';

const icons = Object.entries(courseIcons);

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseIconPicker'>;

export const CourseIconPickerScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { spacing, fontSizes } = useTheme();
  const [searchFilter, setSearchFilter] = useState('');
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const { marginHorizontal } = useSafeAreaSpacing();
  const { uniqueShortcode } = route.params;
  const coursePrefs = useMemo(
    () => coursesPrefs[uniqueShortcode],
    [uniqueShortcode, coursesPrefs],
  );
  const filteredIcons = useMemo(
    () =>
      searchFilter
        ? icons.filter(([k]) => k.toLowerCase().includes(searchFilter))
        : icons,
    [searchFilter],
  );

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: e => setSearchFilter(e.nativeEvent.text.toLowerCase()),
      },
    });
  }, []);

  return (
    <>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={filteredIcons}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              padding: spacing[4],
            }}
            onPress={() => {
              updatePreference('courses', {
                ...coursesPrefs,
                [uniqueShortcode]: {
                  ...coursePrefs,
                  icon: item[0],
                },
              });
              navigation.goBack();
            }}
          >
            <Icon icon={item[1]} size={fontSizes['2xl']} />
          </TouchableOpacity>
        )}
        numColumns={5}
        contentContainerStyle={[
          { paddingHorizontal: spacing[5] },
          marginHorizontal,
        ]}
        ListFooterComponent={
          <>
            <CtaButtonSpacer />
            <BottomBarSpacer />
          </>
        }
      />
      {coursePrefs.icon != null && (
        <CtaButton
          title={t('common.remove')}
          destructive
          action={() => {
            updatePreference('courses', {
              ...coursesPrefs,
              [uniqueShortcode]: {
                ...coursePrefs,
                icon: null,
              },
            } as PreferencesContextBase['courses']);
            navigation.goBack();
          }}
        />
      )}
    </>
  );
};
