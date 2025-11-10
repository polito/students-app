import { ReactNode } from 'react';

export type DialogButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type DialogOptions = {
  title?: string;
  message?: string;
  buttons?: DialogButton[];
  content?: ReactNode;
};

export interface IDialog {
  dialog: (title?: string, message?: string, buttons?: DialogButton[]) => void;
  multiChoiceDialog: (
    title?: string,
    message?: string,
    buttons?: DialogButton[],
  ) => void;
  dialogWithContent: (options: DialogOptions) => void;
}

export declare const Dialog: IDialog;

export declare const DialogProvider: () => JSX.Element | null;
