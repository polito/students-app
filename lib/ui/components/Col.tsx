import { JSXElementConstructor } from 'react';
import { View } from 'react-native';

import { Stack, StackProps } from '@lib/ui/components/Stack';

export type ColProps<T extends JSXElementConstructor<any> = typeof View> =
  StackProps<T> & { readonly direction?: 'column' };

/**
 * Vertical flexbox
 *
 * Shorthand for `Stack` with `direction="column"`
 */
export function Col<T extends JSXElementConstructor<any> = typeof View>(
  props: ColProps<T>,
) {
  return <Stack direction="column" {...props} />;
}
