import {
  Children,
  PropsWithChildren,
  ReactElement,
  cloneElement,
  isValidElement,
} from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { Props as TabProps } from './Tab';

interface Props {
  selectedIndexes?: number[];
}

/**
 * A horizontally scrolling tab bar.
 * To control the selection state of child tabs set the `selectedIndexes`
 * prop to an array of indexes. Leave it undefined to manually control the
 * selection on the children.
 */
export const Tabs = ({
  children,
  style,
  selectedIndexes,
  ...rest
}: PropsWithChildren<ScrollViewProps & Props>) => {
  const { spacing } = useTheme();

  return (
    <ScrollView
      accessible={true}
      accessibilityRole="tablist"
      horizontal
      contentContainerStyle={{
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
      }}
      style={[{ flexGrow: 0, flexShrink: 0 }, style]}
      {...rest}
    >
      {Children.map(children, (c, i) => {
        if (isValidElement(c) && selectedIndexes != null) {
          c = cloneElement(c as ReactElement<TabProps>, {
            selected: selectedIndexes.includes(i),
          });
        }
        return (
          <>
            {c}
            {i < Children.count(children) - 1 && (
              <View
                style={{
                  width: spacing[2],
                }}
              />
            )}
          </>
        );
      })}
    </ScrollView>
  );
};
