import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { MenuView } from '@react-native-menu/menu';

interface DropdownOption {
  id: string;
  title: string;
  image?: string;
  imageColor?: string;
  state?: 'off' | 'on' | 'mixed' | undefined;
}

interface DropdownProps {
  options: DropdownOption[];
  onSelectOption: (value: string) => void;
  value?: string | undefined;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const DropdownField = ({
  options,
  onSelectOption,
  value,
  label,
  placeholder,
  disabled,
}: DropdownProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const displayedValue = useMemo(() => {
    return options?.find(opt => opt?.id === value)?.title ?? '';
  }, [options, value]);

  return (
    <View style={styles.textFieldWrapper}>
      <Text style={styles.textFieldLabel}>{label}</Text>
      <MenuView
        style={{ width: '100%' }}
        title={label}
        shouldOpenOnLongPress={false}
        actions={options}
        onPressAction={({ nativeEvent: { event } }) => {
          !disabled && onSelectOption(event);
        }}
      >
        <TextField
          style={[styles.textField, disabled && styles.textFieldDisabled]}
          label={'label'}
          placeholder={placeholder}
          value={displayedValue}
          editable={false}
          inputStyle={styles.textFieldInput}
        />
        <Col justifyCenter alignCenter style={styles.iconContainer}>
          <Icon icon={faChevronDown} />
        </Col>
      </MenuView>
    </View>
  );
};

const createStyles = ({
  colors,
  shapes,
  spacing,
  fontWeights,
  fontSizes,
}: Theme) =>
  StyleSheet.create({
    iconContainer: {
      position: 'absolute',
      right: 0,
      height: '100%',
      paddingHorizontal: spacing[4],
      backgroundColor: 'transparent',
    },
    textFieldWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
    },
    textField: {
      borderRadius: shapes.sm,
      borderWidth: 1,
      backgroundColor: colors.surface,
      paddingVertical: 0,
      borderBottomLeftRadius: shapes.sm,
      borderColor: colors.divider,
      width: '100%',
      textAlign: 'left',
    },
    textFieldInput: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      borderBottomWidth: 0,
      maxWidth: '90%',
    },
    textFieldDisabled: {
      opacity: 0.5,
    },
    textFieldLabel: {
      color: colors.text['500'],
      fontWeight: fontWeights.normal,
      marginHorizontal: spacing['2'],
      marginVertical: spacing['1'],
    },
  });
