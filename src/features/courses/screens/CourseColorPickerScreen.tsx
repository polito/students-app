import React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ColorPicker, {
  HueSlider,
  InputWidget,
  Panel1,
  Swatches,
} from 'reanimated-color-picker';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseColorPicker'
>;

export const CourseColorPickerScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();

  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const coursePrefs = useMemo(
    () => coursesPrefs[route.params.uniqueShortcode],
    [route.params.uniqueShortcode, coursesPrefs],
  );

  const onColorChange = (color: { hex: string }) => {
    'worklet';
    const { hex } = color;

    runOnJS(updatePreference)('courses', {
      ...coursesPrefs,
      [route.params.uniqueShortcode]: {
        ...coursePrefs,
        color: hex,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <Text style={styles.title}>{t('common.selectColor')}</Text>
      <ColorPicker value={coursePrefs?.color} onComplete={onColorChange}>
        <View style={styles.picker}>
          <Swatches style={styles.swatches} />
          <Panel1 style={styles.panel} />
          <HueSlider style={styles.slider} />
          <InputWidget disableAlphaChannel formats={['HEX']} />
        </View>
      </ColorPicker>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    gap: 15,
  },
  panel: {
    height: 200,
    borderRadius: 8,
  },
  slider: {
    height: 30,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 16,
    textAlign: 'center',
  },
  swatches: {
    gap: 10,
    padding: 10,
  },
});
