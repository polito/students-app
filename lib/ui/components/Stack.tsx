import {
  Children,
  ComponentProps,
  Fragment,
  JSXElementConstructor,
} from 'react';
import { FlexStyle, StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface SpacingShorthands {
  /** Shorthand for `margin` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  m: number;
  /** Shorthand for `marginTop` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  mt: number;
  /** Shorthand for `marginBottom` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  mb: number;
  /** Shorthand for `marginRight` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  mr: number;
  /** Shorthand for `marginLeft` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  ml: number;
  /** Shorthand for `marginHorizontal` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  mh: number;
  /** Shorthand for `marginVertical` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  mv: number;
  /** Shorthand for `padding` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  p: number;
  /** Shorthand for `paddingTop` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  pt: number;
  /** Shorthand for `paddingBottom` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  pb: number;
  /** Shorthand for `paddingRight` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  pr: number;
  /** Shorthand for `paddingLeft` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  pl: number;
  /** Shorthand for `paddingHorizontal` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  ph: number;
  /** Shorthand for `paddingVertical` in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units */
  pv: number;
}

const spacingShorthands: Record<keyof SpacingShorthands, string> = {
  m: 'margin',
  mt: 'marginTop',
  mb: 'marginBottom',
  mr: 'marginRight',
  ml: 'marginLeft',
  mh: 'marginHorizontal',
  mv: 'marginVertical',
  p: 'padding',
  pt: 'paddingTop',
  pb: 'paddingBottom',
  pr: 'paddingRight',
  pl: 'paddingLeft',
  ph: 'paddingHorizontal',
  pv: 'paddingVertical',
} as const;

export type StackProps<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = {
  direction?: 'row' | 'column';
  component?: T;
  /**
   * Main axis alignment
   */
  align?: FlexStyle['alignItems'];
  /**
   * Cross-axis alignment
   */
  justify?: FlexStyle['justifyContent'];
  flex?: FlexStyle['flex'];
  flexBasis?: FlexStyle['flexBasis'];
  flexGrow?: FlexStyle['flexGrow'];
  flexShrink?: FlexStyle['flexShrink'];
  flexWrap?: FlexStyle['flexWrap'];
  /**
   * Gap between items in {@link import('../types/Theme').Theme.spacing `Theme.spacing`} units
   */
  gap?: keyof Theme['spacing'];
} & Partial<SpacingShorthands> &
  Partial<{
    [key in keyof typeof spacingShorthands]: keyof Theme['spacing'];
  }> &
  ComponentProps<T>;

/**
 * A flexbox (row or column) layout
 *
 * See {@link import('../Row').Row `Row`} and {@link import('../Col').Col `Col`} for shorthand alternatives
 */
export const Stack = <
  T extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = typeof View,
>({
  component: Component = View,
  direction = 'row',
  align = 'flex-start',
  justify = 'flex-start',
  flex = undefined,
  flexBasis = undefined,
  flexGrow = undefined,
  flexShrink = undefined,
  flexWrap = undefined,
  gap = undefined,
  children,
  ...props
}: StackProps<T>) => {
  const { spacing } = useTheme();
  const style: StyleProp<ViewStyle> = [
    {
      flexDirection: direction,
      alignItems: align,
      justifyContent: justify,
      flex,
      flexBasis,
      flexGrow,
      flexShrink,
      flexWrap,
    },
    Object.fromEntries(
      Object.entries(spacingShorthands).map(([short, long]) => [
        long,
        spacing[props[short]],
      ]),
    ),
    props.style,
  ];
  const childCound = Children.count(children);
  return (
    <Component {...props} style={style}>
      {gap == null
        ? children
        : Children.map(children, (child, index) => (
            <Fragment key={index}>
              {child}
              {index < childCound - 1 && (
                <View
                  style={{
                    [direction === 'row' ? 'width' : 'height']:
                      spacing[gap as keyof Theme['spacing']],
                  }}
                />
              )}
            </Fragment>
          ))}
    </Component>
  );
};
