import { useMemo, useState } from 'react';
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
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import CustomAlert from '../components/CourseColorWarningModal';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseColorPicker'
>;

export const CourseColorPickerScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const coursePrefs = useMemo(
    () => coursesPrefs[route.params.uniqueShortcode],
    [route.params.uniqueShortcode, coursesPrefs],
  );
  const confirm = useConfirmationDialog({
    title: t('courseColorPickerScreen.areYouSureTitle'),
    message: t('courseColorPickerScreen.areYouSureMessage'),
  });
  const [showModal, setShowModal] = useState(false);
  const [pendingColor, setPendingColor] = useState<string | null>(null);
  const { showColorWarning = true } = usePreferencesContext();
  const handleColorWithConfirm = (hex: string) => {
    if (!showColorWarning) {
      updatePreference('courses', {
        ...coursesPrefs,
        [route.params.uniqueShortcode]: {
          ...coursePrefs,
          color: hex,
        },
      });
      return;
    }
    setPendingColor(hex);
    setShowModal(true);
  };

  const handleConfirm = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      updatePreference('showColorWarning', false);
    }

    if (pendingColor) {
      updatePreference('courses', {
        ...coursesPrefs,
        [route.params.uniqueShortcode]: {
          ...coursePrefs,
          color: pendingColor,
        },
      });
    }
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
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
        <Section>
          <SectionHeader title={t('courseColorPickerScreen.accessibleColor')} />
          <OverviewList indented>
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
          </OverviewList>
        </Section>
        <Section>
          <CustomAlert
            visible={showModal}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            title={t('courseColorPickerScreen.areYouSureTitle')}
            message={t('courseColorPickerScreen.areYouSureMessage')}
            dontShowAgainLabel={t('courseColorPickerScreen.dontShowAgain')}
          />
          <SectionHeader
            title={t('courseColorPickerScreen.customColorTitle')}
          />
          <OverviewList indented>
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
