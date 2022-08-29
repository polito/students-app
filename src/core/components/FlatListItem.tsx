import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

interface Props {
  gap: number;
  numColumns: number;
  index: number;
  itemsCount: number;
}

/**
 * Helper component to render multi-column FlatList items
 */
export const FlatListItem = ({
  gap,
  numColumns,
  index,
  itemsCount,
  children,
  style,
  ...rest
}: PropsWithChildren<ViewProps & Props>) => (
  <View
    style={[
      {
        flex: 1 / numColumns,
        paddingHorizontal: gap / 2,
        paddingRight:
          (index - 1) % numColumns !== 0 && index === itemsCount - 1
            ? gap * 1.5
            : undefined,
      },
      style,
    ]}
    {...rest}
  >
    {children}
  </View>
);
