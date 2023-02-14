import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { MenuView } from '@react-native-menu/menu';

import { SCREEN_WIDTH } from '../../../src/core/constants';

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
        title={label}
        shouldOpenOnLongPress={false}
        actions={options}
        onPressAction={({ nativeEvent: { event } }) => {
          !disabled && onSelectOption(event);
        }}
      >
        <View
          style={[
            styles.textFieldContainer,
            disabled && styles.textFieldDisabled,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.displayedValue,
              !displayedValue && styles.placeholderText,
            ]}
          >
            {displayedValue || placeholder}
          </Text>
          <Icon icon={faChevronDown} />
        </View>
      </MenuView>
    </View>
  );
};

const createStyles = ({ colors, shapes, spacing }: Theme) =>
  StyleSheet.create({
    placeholderText: {
      opacity: 0.9,
    },
    textFieldWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    displayedValue: {
      maxWidth: '80%',
    },
    textFieldContainer: {
      borderRadius: shapes.sm,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing['2.5'],
      borderColor: colors.divider,
      width: SCREEN_WIDTH * 0.9,
    },
    textFieldDisabled: {
      opacity: 0.5,
    },
    textFieldLabel: {
      color: colors.text['200'],
      marginHorizontal: spacing['2'],
      marginVertical: spacing['1'],
    },
    textField: {
      // backgroundColor: 'white',
      // height: 40,
      borderRadius: shapes.sm,
      paddingVertical: 0,
      borderWidth: 1,
      borderColor: colors.divider,
      width: SCREEN_WIDTH * 0.9,
    },
  });
