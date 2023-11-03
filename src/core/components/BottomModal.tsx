import { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

export type BottomModalProps = PropsWithChildren<{
  visible: boolean;
  onClose?: () => void;
  dismissable?: boolean;
}>;

export const BottomModal = ({
  children,
  visible,
  onClose,
  dismissable,
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
        <Pressable
          onPress={() => {
            dismissable && onClose?.();
          }}
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
