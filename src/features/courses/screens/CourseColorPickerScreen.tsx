import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { usePreventRemove } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '~/core/components/BottomBarSpacer.tsx';
import { courseColors } from '~/core/constants.ts';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext.ts';

import ColorPicker, {
  HueSlider,
  InputWidget,
  Panel1,
  Swatches,
} from 'reanimated-color-picker';

import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import CustomAlert from '../components/CourseColorWarningModal';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseColorPicker'
>;

export const CourseColorPickerScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const {
    courses: coursesPrefs,
    updatePreference,
    showColorWarning,
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
        color: temporaryColor.slice(0, 7),
      },
    });
  }, [
    coursesPrefs,
    route.params.uniqueShortcode,
    temporaryColor,
    updatePreference,
  ]);

  const originalColor =
    coursesPrefs[route.params.uniqueShortcode]?.color ?? courseColors[0].color;
  useEffect(() => {
    const hasChanged = temporaryColor !== originalColor;
    if (hasChanged && isSafeColor) {
      saveColor();
    }
  }, [temporaryColor, originalColor, isSafeColor, saveColor]);

  const hasChanged = temporaryColor !== originalColor;
  const isUnsafeChange = hasChanged && !isSafeColor;
  const shouldWarn = isUnsafeChange && showColorWarning !== false;
  const shouldPrevent = hasChanged && shouldWarn && !showModal;

  usePreventRemove(shouldPrevent, ({ data: _data }) => {
    if (shouldPrevent) {
      setShowModal(true);
    }
  });

  const shouldAutoSave =
    hasChanged && !isSafeColor && showColorWarning === false;
  usePreventRemove(shouldAutoSave, ({ data }) => {
    if (shouldAutoSave) {
      saveColor();
      navigation.dispatch(data.action);
    }
  });

  const handleConfirm = useCallback(
    (dontShowAgain: boolean) => {
      setShowModal(false);
      if (dontShowAgain) {
        updatePreference('showColorWarning', false);
      }
      saveColor();
      navigation.goBack();
    },
    [saveColor, updatePreference, navigation],
  );

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setTemporaryColor(originalColor);
    navigation.goBack();
  }, [originalColor, navigation]);

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          decelerationRate="fast"
        >
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
      </GestureHandlerRootView>
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
