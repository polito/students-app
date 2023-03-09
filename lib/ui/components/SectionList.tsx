import { Children, PropsWithChildren } from 'react';
import { ActivityIndicator, Platform, ViewProps } from 'react-native';

import { EmptyState } from '@lib/ui/components/EmptyState';
import { List } from '@lib/ui/components/List';

import { useTheme } from '../hooks/useTheme';
import { Card } from './Card';

type Props = PropsWithChildren<
  ViewProps & {
    style?: ViewProps['style'];
    dividers?: boolean;
    loading?: boolean;
    indented?: boolean;
    emptyStateText?: string;
  }
>;

/**
 * Displays a list of items with automatic dividers inside a card.
 * (Only suitable for short non virtual-scrolled lists)
 */
export const SectionList = ({
  children,
  loading = false,
  indented = false,
  dividers,
  emptyStateText,
  style,
  ...rest
}: Props) => {
  const { spacing } = useTheme();

  return (
    <Card
      accessible={Platform.select({ android: true, ios: false })}
      rounded={Platform.select({ android: false })}
      style={[
        {
          marginVertical: spacing[2],
          marginHorizontal: Platform.select({ ios: spacing[4] }),
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          style={{
            marginVertical: spacing[8],
          }}
        />
      ) : Children.count(children) > 0 ? (
        <List dividers={dividers} indented={indented}>
          {children}
        </List>
      ) : (
        emptyStateText && <EmptyState message={emptyStateText} />
      )}
    </Card>
  );
};
