import { useState } from 'react';
import { Modal, View, Text, Button, Switch } from 'react-native';

type CustomAlertProps = {
  visible: boolean;
  onConfirm: (dontShowAgain: boolean) => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  dontShowAgainLabel?: string;
};

const CustomAlert = ({
                       visible,
                       onConfirm,
                       onCancel,
                       title,
                       message,
                       dontShowAgainLabel,
                     }: CustomAlertProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleOk = () => {
    onConfirm(dontShowAgain);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text>{title}</Text>
          <Text>{message}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Switch value={dontShowAgain} onValueChange={setDontShowAgain} />
            <Text style={{ marginLeft: 8 }}>{dontShowAgainLabel}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="OK" onPress={handleOk} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
