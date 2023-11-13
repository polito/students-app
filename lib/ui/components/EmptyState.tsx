import { StyleSheet, View } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface Props {
  icon?: IconDefinition;
  iconColor?: string;
  iconSize?: number;
  message: string;
  spacing?: number;
}

export const EmptyState = ({
  icon,
  iconColor,
  message,
  spacing = 12,
  iconSize,
}: Props) => {
  const { colors, fontSizes, spacing: _spacing } = useTheme();
  const styles = useStylesheet(createStyles);

  return (
    <View
      style={[
        { padding: _spacing[spacing as unknown as keyof Theme['spacing']] },
        styles.container,
      ]}
    >
      {icon && (
        <Icon
          icon={icon}
          color={iconColor ?? colors.secondaryText}
          size={iconSize || fontSizes['3xl']}
          style={styles.icon}
        />
      )}
      <Text style={{ textAlign: 'center' }} variant="secondaryText">
        {message}
      </Text>
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    icon: {
      marginBottom: spacing[4],
    },
  });
