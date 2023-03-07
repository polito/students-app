import { StyleSheet } from 'react-native';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Card } from '@lib/ui/components/Card';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

interface Props {
  icon: IconProp;
  message: string;
}

export const EmptyCard = ({ icon, message }: Props) => {
  const styles = useStylesheet(createStyles);
  const { colors, fontSizes } = useTheme();
  return (
    <Card rounded spaced style={styles.emptyCard}>
      <Icon
        icon={icon}
        color={colors.heading}
        size={fontSizes['3xl']}
        style={styles.icon}
      />
      <Text>{message}</Text>
    </Card>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    emptyCard: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
    },
    icon: {
      marginBottom: spacing[2],
    },
  });
