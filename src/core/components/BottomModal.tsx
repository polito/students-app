import { PropsWithChildren } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

export type BottomModalProps = PropsWithChildren<{
  visible: boolean;
  onClose?: () => void;
}>;

export const BottomModal = ({
  children,
  visible,
  onClose,
}: BottomModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      animationType="fade"
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
            },
          ]}
        />
        {children}
      </View>
    </Modal>
  );
};
