import { View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  color: string;
}

export const CourseIcon = ({ color }: Props) => {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        width: 20,
        height: 20,
        marginRight: spacing[3],
        borderRadius: 10,
        backgroundColor: color ?? colors.primary[400],
      }}
    />
  );
};
