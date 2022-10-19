import { useMemo } from 'react';

import * as _ from 'lodash';

const defaultStyleProps: { [key: string]: number } = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

const propertyBind: { [key: string]: string } = {
  w: 'width',
  h: 'height',
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
  br: 'borderRadius',
  bgColor: 'backgroundColor',
};

const isValidStyleProp = (propStyle: string) => {
  const [property, propertyValue] = _.split(propStyle, '-');
  return !!property && !!propertyValue;
};

const stylePropValue = (propStyle: string): string | number => {
  const [property, propertyValue] = _.split(propStyle, '-');
  // if (_.toLower(property).includes('color')) {
  //   return COLORS[_.toUpper(property)] ? COLORS[_.toUpper(property)] : propertyValue;
  // }

  const val = defaultStyleProps[propertyValue]
    ? defaultStyleProps[propertyValue]
    : propertyValue;
  return val;
};

const stylePropKey = (propStyle: string): string => {
  const [property, propertyValue] = _.split(propStyle, '-');
  return propertyBind[property] ? propertyBind[property] : property;
};

export const usePropsStyle = (propsStyle: { [key: string]: any }): any => {
  return useMemo((): { [key: string]: any } => {
    return _.reduce(
      Object.keys(propsStyle).filter(isValidStyleProp),
      (acc: { [key: string]: any }, value: string) => {
        const key: string = stylePropKey(value);
        acc[key] = stylePropValue(value);
        return acc;
      },
      {},
    );
  }, [propsStyle]);
};
