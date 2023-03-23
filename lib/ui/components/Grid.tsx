import {
  Children,
  Fragment,
  PropsWithChildren,
  ReactNode,
  useState,
} from 'react';
import { LayoutChangeEvent, View, ViewProps } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { GlobalStyles } from '../../../src/core/styles/globalStyles';

interface Props extends PropsWithChildren<ViewProps> {
  /**
   * The number of columns
   *
   * Use `auto` to automatically determine the number of columns based on min/max column width
   */
  numColumns?: number;
  /**
   * The minimum width of the columns (to be used with `numColumns={auto}")
   */
  minColumnWidth?: number;
  /**
   * The maximum width of the columns (to be used with `numColumns={auto}")
   */
  maxColumnWidth?: number;
  /**
   * Gap between columns and rows in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units
   */
  gap?: keyof Theme['spacing'];
}

export const auto = -1;

export const Grid = ({
  numColumns = 2,
  minColumnWidth = 100,
  maxColumnWidth = 100,
  gap = 5,
  style,
  children,
  onLayout,
  ...rest
}: Props) => {
  const { spacing } = useTheme();
  const [contentWidth, setContentWidth] = useState<number>(null);
  const childrenArray = Children.toArray(children);
  let _numColumns = numColumns;
  const _gap = spacing[gap];
  let columnWidth = 0;
  if (_numColumns === auto) {
    if (maxColumnWidth == null) {
      throw new Error(
        `Grid's maxColumnWidth must be provided when numColumns == auto`,
      );
    }

    if (contentWidth == null || childrenArray.length < 1) {
      _numColumns = 1;
    } else {
      let maxNumColumns = Math.floor(contentWidth / minColumnWidth);
      while (
        maxNumColumns * minColumnWidth + (maxNumColumns - 1) * _gap >
        contentWidth
      ) {
        maxNumColumns--;
      }
      let minNumColumns = Math.round(contentWidth / maxColumnWidth);
      while (
        (contentWidth - Math.max(minNumColumns - 1, 0) * _gap) / minNumColumns <
        minColumnWidth
      ) {
        minNumColumns--;
      }
      _numColumns = Math.max(
        minNumColumns,
        Math.min(childrenArray.length, maxNumColumns),
      );
    }
  }
  columnWidth =
    contentWidth != null
      ? (contentWidth - Math.max(0, _numColumns - 1) * _gap) / _numColumns
      : 0;

  const rows = childrenArray.reduce(
    (_rows: Array<Array<ReactNode>>, child) => {
      if (_rows[_rows.length - 1].length < _numColumns) {
        _rows[_rows.length - 1].push(child);
      } else {
        _rows.push([child]);
      }
      return _rows;
    },
    [[]],
  ) as Array<Array<ReactNode>>;

  const _onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (contentWidth !== width) {
      setContentWidth(width);
    }
    onLayout?.(event);
  };

  return (
    <View {...rest} style={[GlobalStyles.grow, style]} onLayout={_onLayout}>
      {contentWidth == null
        ? null
        : rows.map((r, ri) => (
            <View
              key={ri}
              style={{
                flexDirection: 'row',
                marginBottom:
                  rows.length > 1 && ri < rows.length - 1 ? _gap : undefined,
              }}
            >
              {r.map((c, ci) => {
                const missingColumns =
                  ci === r.length - 1 && r.length < _numColumns
                    ? _numColumns - r.length
                    : 0;
                return (
                  <Fragment key={ci}>
                    {c}
                    {ci < _numColumns - 1 && <View style={{ width: _gap }} />}
                    {missingColumns > 0 ? (
                      <View
                        style={{
                          width:
                            missingColumns * columnWidth +
                            (missingColumns - 1) * _gap,
                        }}
                      />
                    ) : null}
                  </Fragment>
                );
              })}
            </View>
          ))}
    </View>
  );
};
