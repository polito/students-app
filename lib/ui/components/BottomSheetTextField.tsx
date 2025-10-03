import { memo, useCallback } from 'react';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import {
  TranslucentTextField,
  TranslucentTextFieldProps,
} from '@lib/ui/components/TranslucentTextField';

const BottomSheetTextFieldComponent = ({
  onFocus,
  onBlur,
  ...rest
}: TranslucentTextFieldProps) => {
  const handleOnFocus = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus],
  );
  const handleOnBlur = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur],
  );

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
