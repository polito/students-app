import { useContext, useMemo } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { courseIcons } from '../constants';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseIconPicker'>;

export const CourseIconPickerScreen = ({ navigation, route }: Props) => {
  const { spacing, colors, fontSizes } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const { courses: coursesPrefs, updatePreference } =
    useContext(PreferencesContext);
  const { courseId } = route.params;
  const coursePrefs = useMemo(
    () => coursesPrefs[courseId],
    [courseId, coursesPrefs],
  );

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={[{ flex: 1 }, bottomBarAwareStyles]}
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
      contentContainerStyle={{ paddingHorizontal: spacing[5] }}
    />
  );
};
