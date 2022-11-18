import { PropsWithChildren } from 'react';
import { ActivityIndicator, Platform } from 'react-native';

import { List } from '@lib/ui/components/List';

import { useTheme } from '../hooks/useTheme';
import { Card } from './Card';

type Props = PropsWithChildren<{
  dividers?: boolean;
  loading?: boolean;
  indented?: boolean;
}>;

/**
 * Displays a list of items with automatic dividers inside a card.
 * (Only suitable for short non virtual-scrolled lists)
 */
export const SectionList = ({
  children,
  loading = false,
  indented = false,
  dividers,
}: Props) => {
  const { spacing } = useTheme();

  return (
    <Card
      rounded={Platform.select({ android: false })}
      style={{
        marginVertical: spacing[2],
        marginHorizontal: Platform.select({ ios: spacing[4] }),
      }}
    >
      {loading ? (
        <ActivityIndicator
          style={{
            marginVertical: spacing[8],
          }}
        />
      ) : (
        <List dividers={dividers} indented={indented}>
          {children}
        </List>
      )}
    </Card>
  );
};
