import { Children, PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { Divider } from '@lib/ui/components/Divider';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  dividers?: boolean;
  indented?: boolean;
}

/**
 * Renders a list of items with automatic dividers based
 * on the platform
 */
export const List = ({
  dividers = Platform.select({ ios: true, android: false }),
  indented = false,
  children,
}: PropsWithChildren<Props>) => {
  const { spacing } = useTheme();

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {dividers
        ? Children.map(children, (c, i) => {
            return (
              <>
                {c}
                {i < Children.count(children) - 1 &&
                  (indented ? (
                    <IndentedDivider key={`div-${i}`} />
                  ) : (
                    <Divider
                      key={`div-${i}`}
                      style={{
                        marginStart: spacing[5],
                      }}
                    />
                  ))}
              </>
            );
          })
        : children}
    </>
  );
};
