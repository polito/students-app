import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export type PillButtonProps = TouchableOpacityProps & {
  variant?: 'primary' | 'neutral';
};

export const PillButton = ({
  children,
  style,
  variant = 'primary',
  ...props
}: PillButtonProps) => {
  const styles = useStylesheet(createStyles);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variant === 'neutral'
          ? styles.containerNeutral
          : styles.containerPrimary,
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            variant === 'neutral' ? styles.textNeutral : styles.textPrimary,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const createStyles = ({ palettes, spacing, fontWeights }: Theme) =>
  StyleSheet.create({
    container: {
      borderRadius: 10,
      paddingHorizontal: spacing[2.5],
      paddingVertical: spacing[1.5],
    },
    containerNeutral: {
      borderColor: palettes.gray[500],
      borderWidth: 1,
    },
    containerPrimary: {
      backgroundColor: palettes.primary[500],
    },
    text: {
      fontWeight: fontWeights.medium,
    },
    textNeutral: {},
    textPrimary: {
      color: 'white',
    },
  });
