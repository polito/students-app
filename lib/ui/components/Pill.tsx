import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export type PillButtonProps = TouchableOpacityProps;

export const PillButton = ({ children, style, ...props }: PillButtonProps) => {
  const styles = useStylesheet(createStyles);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.7}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const createStyles = ({ palettes, spacing, fontWeights }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: palettes.primary[500],
      borderRadius: 10,
      paddingHorizontal: spacing[2.5],
      paddingVertical: spacing[1.5],
    },
    text: {
      fontWeight: fontWeights.medium,
    },
  });
