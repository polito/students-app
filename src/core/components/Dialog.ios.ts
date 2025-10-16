import { ActionSheetIOS } from 'react-native';

import { IDialog } from './Dialog';

export const Dialog: IDialog = {
  dialog: (title, message, buttons) => {
    const opts = buttons ?? [{ text: 'OK' }];
    const labels = opts.map(b => b.text);

    const cancelButtonIndex = opts.findIndex(b => b.style === 'cancel');
    const destructiveButtonIndex = opts.findIndex(
      b => b.style === 'destructive',
    );

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
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
};
