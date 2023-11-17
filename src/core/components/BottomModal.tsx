import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import Modal from 'react-native-modal';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';

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
      deviceHeight={SCREEN_HEIGHT}
      deviceWidth={SCREEN_WIDTH}
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
