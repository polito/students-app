import { GestureResponderEvent } from 'react-native';

export type Feedback = {
  id?: string;
  text: string;
  isError?: boolean;
  isPersistent?: boolean;
  /**
   * Label and press callback for the action button. It should contain the following properties:
   * - `label` - Label of the action button
   * - `onPress` - Callback that is called when action button is pressed.
   */
  action?: {
    label: string;
    onPress: (e?: GestureResponderEvent) => void;
  };
};
