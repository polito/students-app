import { memo, useCallback, useEffect } from 'react';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
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
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = true;
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, shouldHandleKeyboardEvents],
  );
  const handleOnBlur = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = false;
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, shouldHandleKeyboardEvents],
  );
  useEffect(() => {
    return () => {
      // Reset the flag on unmount
      shouldHandleKeyboardEvents.value = false;
    };
  }, [shouldHandleKeyboardEvents]);

  return (
    <TranslucentTextField
      autoCorrect={false}
      leadingIcon={faSearch}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      {...rest}
    />
  );
};

export const BottomSheetTextField = memo(BottomSheetTextFieldComponent);
