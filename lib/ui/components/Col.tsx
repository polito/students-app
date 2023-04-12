import { JSXElementConstructor } from 'react';
import { View } from 'react-native';

import { Stack, StackProps } from '@lib/ui/components/Stack';

/**
 * Vertical flexbox
 *
 * Shorthand for {@link import('./Stack').Stack `Stack`} with `direction="column"`
 */
export function Col<
  T extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = typeof View,
>(props: StackProps<T> & { readonly direction?: 'column' }) {
  return <Stack direction="column" {...props} />;
}
