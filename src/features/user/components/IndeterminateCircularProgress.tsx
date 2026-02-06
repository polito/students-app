import { StyleSheet, View } from 'react-native';
import { CircleSnail } from 'react-native-progress';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface Props {
  size?: number;
  strokeWidth?: number;
}

export const IndeterminateCircularProgress = ({
  size = 200,
  strokeWidth = 8,
}: Props) => {
  const styles = useStylesheet(createStyles);
  const { palettes } = useTheme();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <CircleSnail
        thickness={strokeWidth}
        size={size}
        color={[palettes.primary[600]]}
        direction="clockwise"
      />
    </View>
  );
};

const createStyles = ({ colors, spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    svg: {
      position: 'absolute',
    },
    textContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    text: {
      fontSize: fontSizes.sm,
      color: colors.heading,
      textAlign: 'center',
      paddingHorizontal: spacing[4],
    },
  });
