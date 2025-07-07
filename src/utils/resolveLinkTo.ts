export type To<ParamList = any> =
  | string
  | {
      screen: keyof ParamList;
      params?: ParamList[keyof ParamList];
    };

export const resolveLinkTo = (linkTo: To<any>) => ({
  name: typeof linkTo === 'string' ? linkTo : linkTo.screen,
  params:
    typeof linkTo === 'object' && 'params' in linkTo
      ? linkTo.params
      : undefined,
});
