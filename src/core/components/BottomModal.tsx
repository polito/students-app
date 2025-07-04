import { PropsWithChildren, useCallback } from 'react';
import { View } from 'react-native';
import Modal from 'react-native-modal';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';

export type BottomModalProps = PropsWithChildren<{
  visible: boolean;
  onClose?: () => void;
  dismissable?: boolean;
  scrollOffset?: number;
  scrollViewRef?: any;
  onModalHide?: () => void;
}>;

export const BottomModal = ({
  children,
  visible,
  onClose,
  dismissable,
  scrollOffset,
  scrollViewRef,
  onModalHide,
}: BottomModalProps) => {
  const handleCloseModal = () => {
    dismissable && onClose?.();
  };

  const handleScrollTo = useCallback(
    (p: any) => {
      if (scrollViewRef && scrollViewRef.current) {
        scrollViewRef.current.scrollTo(p);
      }
    },
    [scrollViewRef],
  );

  return (
    <Modal
      {...Modal.defaultProps}
      onModalHide={onModalHide}
      onBackButtonPress={handleCloseModal}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationOutTiming={400}
      animationInTiming={400}
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
      propagateSwipe
      useNativeDriver={true}
      useNativeDriverForBackdrop
      onSwipeComplete={handleCloseModal}
      scrollOffset={scrollOffset}
      scrollOffsetMax={100}
    >
      <View>{children}</View>
    </Modal>
  );
};
