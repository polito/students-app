import { JSXElementConstructor } from 'react';
import { View } from 'react-native';

import { Stack, StackProps } from '@lib/ui/components/Stack';

export type RowProps<
  T extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = typeof View,
> = StackProps<T> & { readonly direction?: 'row' };

/**
 * Horizontal flexbox
 *
 * Shorthand for {@link import('./Stack').Stack `Stack`} with `direction="row"`
 */
export function Row<
  T extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = typeof View,
>(props: RowProps<T>) {
  return <Stack {...props} />;
}
