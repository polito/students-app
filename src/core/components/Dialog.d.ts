export type DialogButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export interface IDialog {
  dialog: (title?: string, message?: string, buttons?: DialogButton[]) => void;
}

export declare const Dialog: IDialog;

export declare const DialogProvider: () => JSX.Element | null;
