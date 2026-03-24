import { Pressable, StyleSheet, View } from 'react-native';

import { faFolderTree, faList } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface ToggleFilterProps {
  isDirectoryView: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const ToggleFilter = ({
  isDirectoryView,
  onToggle,
  disabled = false,
}: ToggleFilterProps) => {
  const styles = useStylesheet(createStyles);
  const { palettes, dark } = useTheme();

  const activeColor = palettes.primary[dark ? 300 : 500];
  const inactiveColor = palettes.gray[400];

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel="Toggle view"
      accessibilityState={{ disabled }}
    >
      <View style={[styles.tab, isDirectoryView && styles.activeTab]}>
        <Icon
          icon={faFolderTree}
          size={16}
          color={isDirectoryView ? activeColor : inactiveColor}
        />
      </View>
      <View style={[styles.tab, !isDirectoryView && styles.activeTab]}>
        <Icon
          icon={faList}
          size={16}
          color={!isDirectoryView ? activeColor : inactiveColor}
        />
      </View>
    </Pressable>
  );
};

const createStyles = ({ palettes, colors, dark, shapes, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: dark ? colors.surfaceDark : palettes.gray[200],
      borderRadius: shapes.md,
      padding: spacing[1],
      gap: 2,
    },
    tab: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: shapes.sm,
    },
    activeTab: {
      backgroundColor: dark ? colors.background : colors.surface,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 2,
    },
    disabled: {
      opacity: 0.5,
    },
  });
