import { useCallback, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Modal from 'react-native-modal';

import { Col } from '@lib/ui/components/Col.tsx';
import { Row } from '@lib/ui/components/Row.tsx';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { QrEsc } from '../../../core/components/QrEsc.tsx';
import { useDeviceOrientation } from '../../../core/hooks/useDeviceOrientation.ts';

export type AgendaEventVisibilityModalProps = {
  visible: boolean;
  onClose?: () => void;
  dismissable?: boolean;
  student: {
    cognome: string;
    nome: string;
    matricola: string;
    qr: string;
  };
};

export const UserQrModal = ({
  visible,
  onClose,
  dismissable,
  student,
}: AgendaEventVisibilityModalProps) => {
  const deviceOrientation = useDeviceOrientation();

  const handleBackCloseModal = useCallback(() => {
    dismissable && onClose?.();
  }, [dismissable, onClose]);

  useEffect(() => {
    if (deviceOrientation === 'landscape') {
      handleBackCloseModal();
    }
  }, [deviceOrientation, handleBackCloseModal]);

  const { width, height } = useWindowDimensions();
  const styles = useStylesheet(createStyles);

  return (
    <Modal
      {...Modal.defaultProps}
      onBackButtonPress={handleBackCloseModal}
      style={{ margin: 0, justifyContent: 'center' }}
      hasBackdrop={true}
      animationOutTiming={50}
      animationInTiming={50}
      isVisible={visible}
      backdropOpacity={0.4}
      avoidKeyboard={true}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropColor="black"
      deviceHeight={height}
      deviceWidth={width}
      swipeDirection="down"
      useNativeDriver
      supportedOrientations={['landscape', 'portrait']}
      onBackdropPress={handleBackCloseModal}
    >
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <View
          style={[
            deviceOrientation === 'portrait'
              ? { width: '70%' }
              : { height: '95%' },
            styles.modalContainer,
          ]}
          pointerEvents="auto"
        >
          <Row style={styles.modalTitleContainer}>
            <Col>
              <Text style={styles.modalTitle}>
                {student?.cognome.toUpperCase() +
                  '\n' +
                  student?.nome.toUpperCase()}
              </Text>
              <Text>polito.it - {student?.matricola}</Text>
            </Col>
          </Row>
          <QrEsc
            qr={student.qr}
            height={deviceOrientation === 'landscape' ? height / 2 : '100%'}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = ({ colors, fontWeights }: Theme) =>
  StyleSheet.create({
    modalOverlay: {
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.white,
      padding: 20,
      borderRadius: 8,
      shadowColor: colors.black,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    modalTitleContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: fontWeights.bold,
    },
  });
