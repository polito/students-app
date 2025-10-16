import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog as PaperDialog,
  Portal,
  RadioButton,
  Text,
  TouchableRipple,
} from 'react-native-paper';

import { DialogButton, DialogOptions, IDialog } from './Dialog';

let showDialog:
  | ((title?: string, message?: string, buttons?: DialogButton[]) => void)
  | null = null;

let showMultiChoiceDialog:
  | ((title?: string, message?: string, buttons?: DialogButton[]) => void)
  | null = null;

let showDialogWithContent: ((options: DialogOptions) => void) | null = null;

export const Dialog: IDialog = {
  dialog: (title, message, buttons) => {
    showDialog?.(title, message, buttons);
  },
  multiChoiceDialog: (title, message, buttons) => {
    showMultiChoiceDialog?.(title, message, buttons);
  },
  dialogWithContent: options => {
    showDialogWithContent?.(options);
  },
};

export const DialogProvider = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | undefined>('');
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [buttons, setButtons] = useState<DialogButton[]>([]);
  const [value, setValue] = useState('');
  const [customContent, setCustomContent] = useState<ReactNode>(null);
  const [showRadioButtons, setShowRadioButtons] = useState(false);
  const { t } = useTranslation();

  const hideDialog = () => setVisible(false);

  // Generic dialog - simple buttons
  showDialog = (ti, m, b) => {
    setTitle(ti);
    setMessage(m);
    setButtons(b ?? [{ text: 'OK' }]);
    setValue('');
    setCustomContent(null);
    setShowRadioButtons(false);
    setVisible(true);
  };

  // Multi-choice dialog - with radio buttons for selection
  showMultiChoiceDialog = (ti, m, b) => {
    setTitle(ti);
    setMessage(m);
    setButtons(b ?? [{ text: 'OK' }]);
    setValue('');
    setCustomContent(null);
    setShowRadioButtons(true);
    setVisible(true);
  };

  // Dialog with custom content
  showDialogWithContent = options => {
    setTitle(options.title);
    setMessage(options.message);
    setButtons(options.buttons ?? [{ text: 'OK' }]);
    setValue('');
    setCustomContent(options.content ?? null);
    setShowRadioButtons(false);
    setVisible(true);
  };

  return (
    <Portal>
      <PaperDialog visible={visible} onDismiss={hideDialog}>
        {title && <PaperDialog.Title>{title}</PaperDialog.Title>}
        {message && (
          <PaperDialog.Content>
            <Text>{message}</Text>
          </PaperDialog.Content>
        )}
        <PaperDialog.Content>
          {customContent ? (
            customContent
          ) : showRadioButtons ? (
            <RadioButton.Group onValueChange={setValue} value={value}>
              {buttons
                .filter(b => b.style !== 'cancel')
                .map((button, index) => (
                  <TouchableRipple
                    key={index}
                    onPress={() => setValue(index.toString())}
                  >
                    <View style={styles.row}>
                      <RadioButton value={index.toString()} />
                      <Text style={styles.label}>{button.text}</Text>
                    </View>
                  </TouchableRipple>
                ))}
            </RadioButton.Group>
          ) : null}
        </PaperDialog.Content>
        <PaperDialog.Actions>
          {buttons.find(b => b.style === 'cancel') && (
            <Button onPress={hideDialog}>
              {buttons.find(b => b.style === 'cancel')?.text ||
                t('common.cancel')}
            </Button>
          )}
          {showRadioButtons && !customContent && (
            <Button
              onPress={() => {
                const index = parseInt(value, 10);
                buttons.filter(b => b.style !== 'cancel')[index]?.onPress?.();
                hideDialog();
              }}
            >
              {t('common.confirm')}
            </Button>
          )}
          {(customContent || !showRadioButtons) &&
            buttons
              .filter(b => b.style !== 'cancel')
              .map((button, index) => (
                <Button
                  key={index}
                  onPress={() => {
                    button.onPress?.();
                    hideDialog();
                  }}
                >
                  {button.text}
                </Button>
              ))}
        </PaperDialog.Actions>
      </PaperDialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
  },
});
