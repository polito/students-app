import { Platform, StyleSheet } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { TextField, TextFieldProps } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export interface TranslucentTextFieldProps extends TextFieldProps {
  leadingIcon?: IconDefinition;
}

export const TranslucentTextField = ({
  style,
  inputStyle,
  leadingIcon = faMagnifyingGlass,
  ...props
}: TranslucentTextFieldProps) => {
  const styles = useStylesheet(createStyles);
  return (
    <Row style={styles.container} align="center" gap={2} mh={3} pl={3}>
      {leadingIcon && <Icon icon={leadingIcon} style={styles.icon} />}
      <TextField
        clearButtonMode="always"
        {...props}
        style={[styles.textField, style]}
        inputStyle={[styles.input, inputStyle]}
      />
    </Row>
  );
};

const createStyles = ({ colors, spacing }: Theme) =>
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
    },
    input: {
      margin: 0,
      paddingLeft: 0,
      paddingRight: spacing[2],
      borderBottomWidth: 0,
      paddingVertical: spacing[Platform.OS === 'ios' ? 2 : 1],
    },
  });
