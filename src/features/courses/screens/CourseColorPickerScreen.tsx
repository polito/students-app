import React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader.tsx';
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

export const CourseColorPickerScreen = ({ route }: Props) => {
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
    <SafeAreaView>
      <View style={{ paddingVertical: spacing[5] }}>
        <SectionHeader title={t('common.accessibleColor')} />
      <Section style={[{ backgroundColor: colors.surface }]}>
        <ColorPicker value={coursePrefs?.color} onComplete={onColorChange}>
        <View style={styles.picker} >
          <Swatches style={styles.swatches} />
        </View>
      </ColorPicker>
      </Section>
        <SectionHeader title={t('common.customColorWarning')}/>

        <Section style={[{ backgroundColor: colors.surface }]}>
        <ColorPicker value={coursePrefs?.color} onComplete={onColorChange}>
          <Panel1 style={styles.panel} />
          <HueSlider style={styles.slider} />
          <View style={styles.widget} >
            <InputWidget  formats={['HEX']}/>
          </View>
          </ColorPicker>
      </Section>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  picker: {
    marginTop:10,
    marginBottom:10,
    width: '95%',
    alignSelf: 'center',
  },
  panel: {
    marginTop:10,
    marginBottom:10,
    height: 200,
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
  },
  slider: {
    marginTop:10,
    marginBottom:10,
    height: 30,
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
  },
  swatches: {
    gap: 10,
    padding: 5,
  },
  widget: {
    marginTop:10,
    marginBottom:10,
    width: '95%',
    alignSelf: 'center',
  },

});
