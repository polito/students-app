import { StyleSheet } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Card } from '@lib/ui/components/Card';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

interface Props {
  icon: IconDefinition;
  message: string;
}

export const EmptyCard = ({ icon, message }: Props) => {
  const styles = useStylesheet(createStyles);
  return (
    <Card rounded spaced={false} style={styles.emptyCard}>
      <EmptyState message={message} icon={icon} spacing={6} />
    </Card>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    emptyCard: {
      // display: 'flex',
      // alignItems: 'center',
      // justifyContent: 'center',
      // paddingHorizontal: spacing[5],
      // paddingVertical: spacing[4],
      marginVertical: spacing[2],
    },
  });
