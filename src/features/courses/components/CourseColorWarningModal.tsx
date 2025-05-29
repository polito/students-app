import React, { useState } from 'react';
import { Modal, View, Text, Button, Switch } from 'react-native';

const CustomAlert = () => {
  const [visible, setVisible] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleOk = () => {
    if (dontShowAgain) {
      // Save to AsyncStorage or similar to not show again
    }
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text>
            Do you want to proceed?
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Switch value={dontShowAgain} onValueChange={setDontShowAgain} />
          <Text style={{ marginLeft: 8 }}>
            Don't show again
          </Text>
          </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
          <Button title="Cancel" onPress={() => setVisible(false)} />
          <Button title="OK" onPress={handleOk} />
        </View>
      </View>
      </View>
  </Modal>
);
};

export default CustomAlert;
