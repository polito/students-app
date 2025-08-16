import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { OverviewList } from '@lib/ui/components/OverviewList';
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

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { courseColors } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import CustomAlert from '../components/CourseColorWarningModal';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseColorPicker'
>;

export const CourseColorPickerScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const {
    courses: coursesPrefs,
    updatePreference,
    showColorWarning = true,
  } = usePreferencesContext();

  const [isSafeColor, setIsSafeColor] = useState(true);
  const [temporaryColor, setTemporaryColor] = useState(
    coursesPrefs[route.params.uniqueShortcode]?.color ?? courseColors[0].color,
  );
  const [showModal, setShowModal] = useState(false);

  const saveColor = useCallback(() => {
    updatePreference('courses', {
      ...coursesPrefs,
      [route.params.uniqueShortcode]: {
        ...coursesPrefs[route.params.uniqueShortcode],
        color: temporaryColor,
      },
    });
  }, [
    coursesPrefs,
    route.params.uniqueShortcode,
    temporaryColor,
    updatePreference,
  ]);

  useEffect(() => {
    const originalColor = coursesPrefs[route.params.uniqueShortcode]?.color;
    if (temporaryColor !== originalColor) {
      if (!isSafeColor && showColorWarning) {
        setShowModal(true);
      } else {
        saveColor();
      }
    }
  }, [
    temporaryColor,
    isSafeColor,
    showColorWarning,
    saveColor,
    coursesPrefs,
    route.params.uniqueShortcode,
  ]);

  const handleConfirm = useCallback(
    (dontShowAgain: boolean) => {
      setShowModal(false);
      if (dontShowAgain) {
        updatePreference('showColorWarning', false);
      }
      saveColor();
    },
    [saveColor, updatePreference],
  );

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setTemporaryColor(
      coursesPrefs[route.params.uniqueShortcode]?.color ??
        courseColors[0].color,
    );
  }, [coursesPrefs, route.params.uniqueShortcode]);

  const onCustomColorChange = (color: { hex: string }) => {
    'worklet';
    runOnJS(setIsSafeColor)(false);
    runOnJS(setTemporaryColor)(color.hex);
  };

  const onSwatchColorChange = (color: { hex: string }) => {
    'worklet';
    runOnJS(setIsSafeColor)(true);
    runOnJS(setTemporaryColor)(color.hex);
  };

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <SafeAreaView>
          <View style={{ paddingVertical: spacing[5] }}>
            <Section>
              <SectionHeader
                title={t('courseColorPickerScreen.accessibleColor')}
              />
              <OverviewList indented>
                <ColorPicker
                  value={temporaryColor}
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
              </OverviewList>
            </Section>
            <Section>
              <SectionHeader
                title={t('courseColorPickerScreen.customColorTitle')}
              />
              <OverviewList indented>
                <ColorPicker
                  value={temporaryColor}
                  onComplete={onCustomColorChange}
                >
                  <Panel1 style={styles.panel} />
                  <HueSlider style={styles.slider} />
                  <View style={styles.widget}>
                    <InputWidget
                      defaultFormat="HEX"
                      formats={['HEX']}
                      disableAlphaChannel={true}
                      containerStyle={{
                        padding: spacing[3],
                      }}
                      inputStyle={{
                        color: colors.prose,
                        fontFamily: 'Montserrat',
                      }}
                      inputTitleStyle={{
                        color: colors.title,
                        fontSize: 14,
                        fontFamily: 'Montserrat',
                      }}
                      iconColor={colors.link}
                      inputProps={{
                        placeholderTextColor: colors.secondaryText,
                      }}
                    />
                  </View>
                </ColorPicker>
              </OverviewList>
            </Section>
          </View>
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      <CustomAlert
        visible={showModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        footer={t('courseColorPickerScreen.areYouSureTitle')}
        message={t('courseColorPickerScreen.areYouSureMessage')}
        dontShowAgainLabel={t('courseColorPickerScreen.dontShowAgain')}
      />
    </>
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
    width: '90%',
    alignSelf: 'center',
  },
  slider: {
    marginTop: 10,
    marginBottom: 10,
    height: 30,
    borderRadius: 8,
    width: '90%',
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
