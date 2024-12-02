import { PropsWithChildren } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Modal from 'react-native-modal';

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
  const handleCloseModal = () => {
    dismissable && onClose?.();
  };

  const { width, height } = useWindowDimensions();

  return (
    <Modal
      {...Modal.defaultProps}
      onBackButtonPress={handleCloseModal}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationOutTiming={400}
      animationInTiming={300}
      isVisible={visible}
      backdropOpacity={0.4}
      avoidKeyboard={true}
      animationIn="slideInUp"
      animationOut="slideOutUp"
      backdropColor="black"
      deviceHeight={height}
      deviceWidth={width}
      swipeDirection="down"
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={400}
      useNativeDriver
      supportedOrientations={['landscape', 'portrait']}
      onBackdropPress={handleCloseModal}
    >
      <View>{children}</View>
    </Modal>
  );
};
