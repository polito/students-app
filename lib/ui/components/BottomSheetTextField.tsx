import { memo, useCallback } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInputFocusEventData,
  TextInputProps,
  ViewStyle,
} from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { useBottomSheetKeyboard } from '@lib/ui/components/BottomSheet';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { TextFieldProps } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

export interface BottomSheetTextFieldProps
  extends Omit<TextFieldProps, 'inputRef'> {
  leadingIcon?: IconDefinition;
  isClearable?: boolean;
  onClear?: () => void;
  onClearLabel?: string;
  containerStyle?: ViewStyle;
  isLoading?: boolean;
}

const BottomSheetTextFieldComponent = ({
  containerStyle,
  inputStyle,
  leadingIcon,
  isClearable,
  onClear,
  onClearLabel,
  isLoading,
  label,
  onFocus,
  onChangeText,
  ...rest
}: BottomSheetTextFieldProps) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const keyboardContext = useBottomSheetKeyboard();

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
    },
    [onChangeText],
  );

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    keyboardContext?.onTextFieldFocus();
    onFocus?.(e);
  };

  return (
    <Row
      style={[styles.container, containerStyle]}
      align="center"
      gap={2}
      mh={3}
      ph={3}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        leadingIcon && <Icon icon={leadingIcon} style={styles.icon} />
      )}
      <BottomSheetTextInput
        clearButtonMode="never"
        placeholder={label}
        keyboardType="twitter"
        placeholderTextColor={colors.secondaryText}
        selectionColor={colors.link}
        style={[
          styles.textInput,
          {
            textAlignVertical:
              (rest.numberOfLines ?? 1) === 1 ? 'center' : 'top',
          },
          inputStyle,
        ]}
        onFocus={handleFocus}
        {...(rest as TextInputProps)}
        onChangeText={handleChangeText}
      />
      {isClearable && (
        <IconButton
          noPadding
          onPress={onClear}
          icon={faTimesCircle}
          color={styles.cancelIcon.color}
          accessibilityRole="button"
          accessibilityLabel={onClearLabel}
        />
      )}
    </Row>
  );
};

const createStyles = ({
  colors,
  dark,
  palettes,
  spacing,
  fontSizes,
  fontFamilies,
}: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.translucentSurface,
      borderRadius: 12,
    },
    textInput: {
      flex: 1,
      fontFamily: fontFamilies.body,
      fontSize: fontSizes.md,
      color: colors.prose,
      margin: 0,
      paddingLeft: 0,
      paddingRight: spacing[2],
      borderBottomWidth: 0,
      paddingVertical: spacing[Platform.OS === 'ios' ? 2 : 1],
    },
    icon: {
      opacity: 0.8,
      marginRight: spacing[1],
    },
    cancelIcon: {
      color: dark ? palettes.gray[400] : palettes.gray[500],
    },
  });

export const BottomSheetTextField = memo(BottomSheetTextFieldComponent);
