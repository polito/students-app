import { View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

/**
 * An aesthetic separator for section titles
 */
export const Separator = () => {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        width: 32,
        height: 4,
        marginBottom: spacing[2],
        backgroundColor: colors.secondary[600],
      }}
    />
  );
};
