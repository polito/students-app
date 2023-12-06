import { Platform, StyleSheet, ViewStyle } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { TextField, TextFieldProps } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export interface TranslucentTextFieldProps extends TextFieldProps {
  leadingIcon?: IconDefinition;
  isClearable?: boolean;
  onClear?: () => void;
  onClearLabel?: string;
  containerStyle?: ViewStyle;
  isLoading?: boolean;
}

export const TranslucentTextField = ({
  containerStyle,
  style,
  inputStyle,
  leadingIcon,
  isClearable,
  onClear,
  onClearLabel,
  isLoading,
  ...props
}: TranslucentTextFieldProps) => {
  const styles = useStylesheet(createStyles);
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
      <TextField
        clearButtonMode="never"
        {...props}
        style={[styles.textField, style]}
        inputStyle={[styles.input, inputStyle]}
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

const createStyles = ({ colors, dark, palettes, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.translucentSurface,
      borderRadius: 12,
    },
    textField: {
      flex: 1,
      paddingVertical: 0,
    },
    icon: {
      opacity: 0.8,
      marginRight: spacing[1],
    },
    input: {
      margin: 0,
      paddingLeft: 0,
      paddingRight: spacing[2],
      borderBottomWidth: 0,
      paddingVertical: spacing[Platform.OS === 'ios' ? 2 : 1],
    },
    cancelIcon: {
      color: dark ? palettes.gray[400] : palettes.gray[500],
    },
  });
