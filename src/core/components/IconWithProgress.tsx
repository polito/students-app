import { StyleSheet, View } from 'react-native';
import { Circle as ProgressIndicator } from 'react-native-progress';

import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface Props {
  icon: any;
  progress?: number;
  size?: number;
  color?: string;
  progressColor?: string;
  style?: any;
}

export const IconWithProgress = ({
  icon,
  progress,
  size = 24,
  color,
  progressColor,
  style,
}: Props) => {
  const { palettes } = useTheme();
  const styles = useStylesheet(createStyles);

  const finalColor = color || palettes.primary[400];
  const finalProgressColor = progressColor || palettes.primary[500];

  return (
    <View style={[styles.container, style]}>
      <Icon icon={icon} size={size} color={finalColor} />
      {progress !== undefined && progress > 0 && (
        <View style={styles.progressContainer}>
          <ProgressIndicator
            progress={progress}
            size={size + 12}
            thickness={3}
            color={finalProgressColor}
            borderWidth={0}
            unfilledColor="rgba(255, 255, 255, 0.3)"
            showsText={false}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (_: Theme) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressContainer: {
      position: 'absolute',
      top: -6,
      left: -6,
    },
  });
