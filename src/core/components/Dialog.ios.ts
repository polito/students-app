import { ActionSheetIOS, Alert } from 'react-native';

import { IDialog } from './Dialog';

export const Dialog: IDialog = {
  // Generic dialog - uses Alert for simple dialogs
  dialog: (title, message, buttons) => {
    const opts = buttons ?? [{ text: 'OK' }];
    const alertButtons = opts.map(btn => ({
      text: btn.text,
      onPress: btn.onPress,
      style: btn.style,
    }));

    Alert.alert(title ?? '', message, alertButtons);
  },

  // Multi-choice dialog - uses ActionSheet for radio-button-like selection
  multiChoiceDialog: (title, message, buttons) => {
    const opts = buttons ?? [{ text: 'OK' }];
    const labels = opts.map(b => b.text);

    const cancelButtonIndex = opts.findIndex(b => b.style === 'cancel');
    const destructiveButtonIndex = opts.findIndex(
      b => b.style === 'destructive',
    );

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: title ?? undefined,
        message: message ?? undefined,
        options: labels,
        cancelButtonIndex:
          cancelButtonIndex >= 0 ? cancelButtonIndex : undefined,
        destructiveButtonIndex:
          destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
      },
      buttonIndex => {
        const btn = opts[buttonIndex];
        btn?.onPress?.();
      },
    );
  },

  // Dialog with custom content - fallback to Alert on iOS (can't render custom content)
  dialogWithContent: options => {
    const opts = options.buttons ?? [{ text: 'OK' }];
    const alertButtons = opts.map(btn => ({
      text: btn.text,
      onPress: btn.onPress,
      style: btn.style,
    }));

    Alert.alert(options.title ?? '', options.message, alertButtons);
  },
};

export const DialogProvider = () => null;
