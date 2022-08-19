import { Children, PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from './Card';
import { Divider } from './Divider';

type Props = PropsWithChildren<{
  dividers?: boolean;
}>;

/**
 * Displays a list of items with automatic dividers inside a card.
 * (Only suitable for short non virtual-scrolled lists)
 */
export const SectionList = ({
  children,
  dividers = Platform.select({ ios: true, android: false }),
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
      {dividers
        ? Children.map(children, (c, i) => {
            return (
              <>
                {c}
                {i < Children.count(children) - 1 && (
                  <Divider
                    key={`div-${i}`}
                    style={{ marginStart: spacing[5] }}
                  />
                )}
              </>
            );
          })
        : children}
    </Card>
  );
};
