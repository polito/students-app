import { memo, useCallback } from 'react';
import { NativeSyntheticEvent } from 'react-native';

import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import {
  TranslucentTextField,
  TranslucentTextFieldProps,
} from '@lib/ui/components/TranslucentTextField';

const BottomSheetTextFieldComponent = ({
  onFocus,
  onBlur,
  ...rest
}: TranslucentTextFieldProps) => {
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

  const handleOnFocus = useCallback(
    (args: NativeSyntheticEvent<any>) => {
      shouldHandleKeyboardEvents.value = true;
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, shouldHandleKeyboardEvents],
  );
  const handleOnBlur = useCallback(
    (args: NativeSyntheticEvent<any>) => {
      shouldHandleKeyboardEvents.value = false;
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, shouldHandleKeyboardEvents],
  );

  return (
    <TranslucentTextField
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      {...rest}
    />
  );
};

export const BottomSheetTextField = memo(BottomSheetTextFieldComponent);
