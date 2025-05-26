import React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ColorPicker, {
  HueSlider,
  InputWidget,
  Panel1,
  Swatches,
} from 'reanimated-color-picker';

import { courseColors } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
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
  const confirm = useConfirmationDialog({
    title: t('common.areYouSureColorAccessibility?'),
  });
  const handleColorWithConfirm = async (hex: string) => {
    const confirmed = await confirm();
    if (confirmed) {
      updatePreference('courses', {
        ...coursesPrefs,
        [route.params.uniqueShortcode]: {
          ...coursePrefs,
          color: hex,
        },
      });
    }
  };

  const onCustomColorChange = (color: { hex: string }) => {
    'worklet';
    runOnJS(handleColorWithConfirm)(color.hex);
  };

  const onSwatchColorChange = (color: { hex: string }) => {
    'worklet';
    runOnJS(updatePreference)('courses', {
      ...coursesPrefs,
      [route.params.uniqueShortcode]: {
        ...coursePrefs,
        color: color.hex,
      },
    });
  };

  return (
    <SafeAreaView>
      <View style={{ paddingVertical: spacing[5] }}>
        <SectionHeader title={t('common.accessibleColor')} />
        <Section style={[{ backgroundColor: colors.surface }]}>
          <ColorPicker
            value={coursePrefs?.color}
            onComplete={onSwatchColorChange}
          >
            <View style={styles.picker}>
              <Swatches
                style={styles.swatchesContainer}
                swatchStyle={styles.swatchItem}
                colors={courseColors.map(c => c.color)}
              />
            </View>
          </ColorPicker>
        </Section>
        <SectionHeader title={t('common.customColorWarning')} />
        <Section style={[{ backgroundColor: colors.surface }]}>
          <ColorPicker
            value={coursePrefs?.color}
            onComplete={onCustomColorChange}
          >
            <Panel1 style={styles.panel} />
            <HueSlider style={styles.slider} />
            <View style={styles.widget}>
              <InputWidget formats={['HEX']} />
            </View>
          </ColorPicker>
        </Section>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  picker: {
    marginTop: 10,
    marginBottom: 10,
    width: '95%',
    alignSelf: 'center',
  },
  panel: {
    marginTop: 10,
    marginBottom: 10,
    height: 200,
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
  },
  slider: {
    marginTop: 10,
    marginBottom: 10,
    height: 30,
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
  },
  swatchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  swatchItem: {
    width: '12%',
    aspectRatio: 1,
    borderRadius: 9999,
    marginBottom: 10,
  },

  widget: {
    marginTop: 10,
    marginBottom: 10,
    width: '95%',
    alignSelf: 'center',
  },
});
