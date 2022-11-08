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
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: color ?? colors.primary[400],
      }}
    />
  );
};
