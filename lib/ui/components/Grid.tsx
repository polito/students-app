import { Children, Fragment, PropsWithChildren, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

import { GlobalStyles } from '../../../src/core/styles/globalStyles';

interface Props {
  numColumns?: number;
  gap?: number;
}

export const Grid = ({
  numColumns = 2,
  gap = 18,
  style,
  children,
  ...rest
}: PropsWithChildren<ViewProps & Props>) => {
  const rows = Children.toArray(children).reduce(
    (_rows: Array<Array<ReactNode>>, child) => {
      if (_rows[_rows.length - 1].length < numColumns) {
        _rows[_rows.length - 1].push(child);
      } else {
        _rows.push([child]);
      }
      return _rows;
    },
    [[]],
  ) as Array<Array<ReactNode>>;
  return (
    <View style={[{ flex: 1 }, style]} {...rest}>
      {rows.map((r, ri) => (
        <View
          key={ri}
          style={{
            flexDirection: 'row',
            marginBottom:
              rows.length > 1 && ri < rows.length - 1 ? gap : undefined,
          }}
        >
          {r.map((c, ci) => (
            <Fragment key={ci}>
              {c}
              {((r.length > 1 && ci < r.length - 1) ||
                r.length < numColumns) && (
                <>
                  <View style={{ width: gap }} />
                  {r.length < numColumns ? (
                    <View style={GlobalStyles.grow} />
                  ) : null}
                </>
              )}
            </Fragment>
          ))}
        </View>
      ))}
    </View>
  );
};
