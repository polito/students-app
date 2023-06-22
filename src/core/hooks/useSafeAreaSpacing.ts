import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SpacingType = 'padding' | 'margin';
type HorizontalStyles<T extends SpacingType> = {
  [key in `${T}Top` | `${T}Bottom`]: number;
};
type VerticalStyles<T extends SpacingType> = {
  [key in `${T}Left` | `${T}Right`]: number;
};

/**
 * Provides memoized styles for handling safe area spacing using either margin
 * or padding
 */
export const useSafeAreaSpacing = () => {
  const { top, left, right, bottom } = useSafeAreaInsets();
  return useMemo(() => {
    return Object.fromEntries(
      ['padding', 'margin'].flatMap(property => {
        const h = {
          [`${property}Left`]: left,
          [`${property}Right`]: right,
        };
        const v = {
          [`${property}Top`]: top,
          [`${property}Bottom`]: bottom,
        };
        return [
          [property, { ...h, ...v }] as const,
          [`${property}Horizontal`, h] as const,
          [`${property}Vertical`, v] as const,
        ];
      }),
    ) as {
      [key in SpacingType]: HorizontalStyles<key> & VerticalStyles<key>;
    } & {
      [key in SpacingType as `${SpacingType}Horizontal`]: HorizontalStyles<key>;
    } & {
      [key in SpacingType as `${SpacingType}Vertical`]: VerticalStyles<key>;
    };
  }, [top, left, right, bottom]);
};
