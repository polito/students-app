import { useCallback, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { HeaderBackButton } from '@react-navigation/elements';
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
  const [navigationAction, setNavigationAction] = useState<'back' | null>(null);

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

  const onPressBack = useCallback(() => {
    if (temporaryColor === coursesPrefs[route.params.uniqueShortcode]?.color) {
      return navigation.goBack();
    }
    if (!showColorWarning || isSafeColor) {
      saveColor();
      return navigation.goBack();
    }
    setNavigationAction('back');
    setShowModal(true);
  }, [
    temporaryColor,
    coursesPrefs,
    route.params.uniqueShortcode,
    showColorWarning,
    isSafeColor,
    saveColor,
    navigation,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: Platform.OS === 'ios' ? false : true,
      headerBackButtonMenuEnabled: false,
      headerLeft: props => (
        <HeaderBackButton {...props} onPress={onPressBack} />
      ),
    });
  }, [navigation, onPressBack]);

  const handleConfirm = useCallback(
    (dontShowAgain: boolean) => {
      setShowModal(false);
      if (dontShowAgain) {
        updatePreference('showColorWarning', false);
      }
      saveColor();
      if (navigationAction === 'back') {
        navigation.goBack();
      }
    },
    [saveColor, updatePreference, navigationAction, navigation],
  );

  const handleCancel = useCallback(() => {
    setShowModal(false);
  }, []);

  const onCustomColorChange = (color: { hex: string }) => {
    'worklet';
    const cleanHex = color.hex.length === 9 ? color.hex.slice(0, 7) : color.hex;
    runOnJS(setIsSafeColor)(false);
    runOnJS(setTemporaryColor)(cleanHex);
  };

  const onSwatchColorChange = (color: { hex: string }) => {
    'worklet';
    const cleanHex = color.hex.length === 9 ? color.hex.slice(0, 7) : color.hex;
    runOnJS(setIsSafeColor)(true);
    runOnJS(setTemporaryColor)(cleanHex);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
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
      </SafeAreaView>
    </ScrollView>
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
