import { JSXElementConstructor } from 'react';
import { View } from 'react-native';

import { Stack, StackProps } from '@lib/ui/components/Stack';

/**
 * Horizontal flexbox
 *
 * Shorthand for {@link import('../Stack').Stack `Stack`} with `direction="row"`
 */
export function Row<
  T extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = typeof View,
>(props: StackProps<T> & { readonly direction?: 'row' }) {
  return <Stack {...props} />;
}
