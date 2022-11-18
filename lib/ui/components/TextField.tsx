import { Ref } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

interface Props {
  inputRef?: Ref<TextInput>;
  label?: string;
  type?: 'text' | 'password';
}

/**
 * A text input field
 */
export const TextField = ({
  inputRef,
  label,
  type,
  style,
  ...rest
}: TextInputProps & Props) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);

  const textInputProps = ((): TextInputProps => {
    switch (type) {
      case 'password':
        return {
          autoComplete: 'password',
          secureTextEntry: true,
        };
      default:
        return {};
    }
  })();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={inputRef}
        autoCapitalize="none"
        selectionColor={colors.link}
        placeholderTextColor={colors.divider}
        style={[styles.input, style]}
        {...textInputProps}
        {...rest}
      />
    </View>
  );
};

const createStyles = ({ fontSizes, spacing, colors }: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing[5],
    },
    label: {
      fontSize: fontSizes.md,
      marginBottom: 5,
    },
    input: {
      fontSize: fontSizes.lg,
      borderBottomWidth: 1,
      borderColor: colors.prose,
      backgroundColor: colors.surface,
      color: colors.prose,
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[2],
    },
  });
