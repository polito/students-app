import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';
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

import { courseColors } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import CustomAlert from '../components/CourseColorWarningModal';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseColorPicker'
>;

export const CourseColorPickerScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const [isSafeColor, setIsSafeColor] = useState(true);
  const { spacing, colors } = useTheme();
  const {
    courses: coursesPrefs,
    updatePreference,
    showColorWarning = true,
  } = usePreferencesContext();

  const [temporaryColor, setTemporaryColor] = useState(
    coursesPrefs[route.params.uniqueShortcode]?.color ?? courseColors[0].color,
  );
  const [showModal, setShowModal] = useState(false);
  const [navigationEvent, setNavigationEvent] = useState<any>(null);
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
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (
        temporaryColor === coursesPrefs[route.params.uniqueShortcode]?.color
      ) {
        // No changes made, allow navigation
        return;
      }

      if (!showColorWarning || isSafeColor) {
        // If warnings are disabled or the color is from swatches, save and exit
        saveColor();
        return;
      }

      e.preventDefault();
      setNavigationEvent(e);
      setShowModal(true);
    });
    return unsubscribe;
  }, [
    navigation,
    temporaryColor,
    showColorWarning,
    coursesPrefs,
    route.params.uniqueShortcode,
    isSafeColor,
    saveColor,
  ]);

  const handleConfirm = useCallback(
    (dontShowAgain: boolean) => {
      setShowModal(false);
      if (dontShowAgain) {
        updatePreference('showColorWarning', false);
      }
      saveColor();
      if (navigationEvent) {
        navigation.dispatch(navigationEvent.data.action);
      }
    },
    [saveColor, updatePreference, navigationEvent, navigation],
  );

  const handleCancel = useCallback(() => {
    setShowModal(false);
  }, []);

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
    <SafeAreaView>
      <CustomAlert
        visible={showModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        footer={t('courseColorPickerScreen.areYouSureTitle')}
        message={t('courseColorPickerScreen.areYouSureMessage')}
        dontShowAgainLabel={t('courseColorPickerScreen.dontShowAgain')}
      />
      <View style={{ paddingVertical: spacing[5] }}>
        <Section>
          <SectionHeader title={t('courseColorPickerScreen.accessibleColor')} />
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
