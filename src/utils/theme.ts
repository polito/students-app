import { useMemo } from 'react';

const defaultStyleProps: Record<string, number> = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

const propertyBind: Record<string, string> = {
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
  bg: 'backgroundColor',
};

const isValidStyleProp = (propStyle: string) => {
  const [property, propertyValue] = propStyle.split('-');
  return !!property && !!propertyValue;
};

const stylePropValue = (propStyle: string): string | number => {
  const [property, propertyValue] = propStyle.split('-');

  const val = defaultStyleProps[propertyValue]
    ? defaultStyleProps[propertyValue]
    : propertyValue;
  return val;
};

const stylePropKey = (propStyle: string): string => {
  const [property, propertyValue] = propStyle.split('-');
  return propertyBind[property] ? propertyBind[property] : property;
};

export const usePropsStyle = (propsStyle: Record<string, any>): any => {
  return useMemo((): Record<string, string | number> => {
    return Object.keys(propsStyle)
      .filter(isValidStyleProp)
      .reduce((acc: Record<string, string | number>, value: string) => {
        const key: string = stylePropKey(value);
        acc[key] = stylePropValue(value);
        return acc;
      }, {});
  }, []);
};
