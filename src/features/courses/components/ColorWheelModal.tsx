// ColorWheelModal.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import {
  OpacitySlider,
  Panel1,
  PreviewText,
  Swatches,
} from 'reanimated-color-picker';

interface ColorWheelModalProps {
  visible: boolean;
  onClose: () => void;
  onColorSelected: (color: string) => void;
  initialColor?: string;
}

export const ColorWheelModal = ({
  visible,
  onClose,
  onColorSelected,
  initialColor = '#DC2626',
}: ColorWheelModalProps) => {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();

  const onSelect = ({ hex }: { hex: string }) => {
    onColorSelected(hex);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.content, { backgroundColor: colors.surface }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.title}>{t('common.selectColor')}</Text>

          <View style={styles.picker}>
            <Panel1 style={styles.panel} />
            <OpacitySlider style={styles.slider} />
            <PreviewText
              style={[styles.previewText, { color: colors.prose }]}
            />
            <Swatches style={styles.swatches} />
          </View>

          <Row justify="center" style={{ marginTop: spacing[4] }}>
            <ListItem title={t('common.cancel')} isAction onPress={onClose} />
          </Row>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
