import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

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
  const { colors } = useTheme();
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

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.translucentSurface,
    },
    container: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 10,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    switchLabel: {
      marginLeft: 8,
      color: colors.prose,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
    },
    titleText: {
      color: colors.title,
    },
    messageText: {
      color: colors.prose,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>
          <View style={styles.switchContainer}>
            <Switch
              value={dontShowAgain}
              onValueChange={setDontShowAgain}
              trackColor={{
                false: colors.tabBarInactive,
                true: colors.link,
              }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.tabBarInactive}
            />
            <Text style={styles.switchLabel}>{dontShowAgainLabel}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onCancel} color={colors.link} />
            <Button title="OK" onPress={handleOk} color={colors.link} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
