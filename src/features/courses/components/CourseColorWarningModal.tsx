import { useEffect, useState } from 'react';
import { Button, Modal, Switch, Text, View } from 'react-native';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext.ts';

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
  const { updatePreference, showColorWarning = true } = usePreferencesContext();
  const [dontShowAgain, setDontShowAgain] = useState(!showColorWarning);

  useEffect(() => {
    setDontShowAgain(!showColorWarning);
  }, [showColorWarning]);

  const handleOk = () => {
    if (dontShowAgain) {
      updatePreference('showColorWarning', false);
    }
    onConfirm(dontShowAgain);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000000aa',
        }}
      >
        <View
          style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}
        >
          <Text>{title}</Text>
          <Text>{message}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            <Switch value={dontShowAgain} onValueChange={setDontShowAgain} />
            <Text style={{ marginLeft: 8 }}>{dontShowAgainLabel}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 20,
            }}
          >
            <Button title="Cancel" onPress={onCancel} />
            <Button title="OK" onPress={handleOk} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
