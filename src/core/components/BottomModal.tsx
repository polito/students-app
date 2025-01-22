import { PropsWithChildren, useRef } from 'react';
import { ScrollView, View } from 'react-native';
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

  const scrollViewRef = useRef<ScrollView>(null);

  const handleScrollTo = (position: {
    x?: number;
    y?: number;
    animated?: boolean;
  }) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(position);
    }
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
      swipeDirection={['down']}
      supportedOrientations={['landscape', 'portrait']}
      onBackdropPress={handleCloseModal}
      scrollTo={handleScrollTo}
      useNativeDriver={false}
      useNativeDriverForBackdrop
      onSwipeComplete={handleCloseModal}
    >
      <View>{children}</View>
    </Modal>
  );
};
