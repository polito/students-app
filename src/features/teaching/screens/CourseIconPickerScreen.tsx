import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, TouchableOpacity } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { courseIcons } from '../constants';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseIconPicker'>;

export const CourseIconPickerScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { spacing, fontSizes } = useTheme();
  const { courses: coursesPrefs, updatePreference } =
    useContext(PreferencesContext);
  const { courseId } = route.params;
  const coursePrefs = useMemo(
    () => coursesPrefs[courseId],
    [courseId, coursesPrefs],
  );

  return (
    <>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={Object.entries(courseIcons)}
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
                [courseId]: {
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
        contentContainerStyle={[{ paddingHorizontal: spacing[5] }]}
      />
      {coursePrefs.icon != null && (
        <CtaButton
          title={t('common.remove')}
          destructive
          action={() => {
            updatePreference('courses', {
              ...coursesPrefs,
              [courseId]: {
                ...coursePrefs,
                icon: null,
              },
            });
            navigation.goBack();
          }}
        />
      )}
    </>
  );
};
