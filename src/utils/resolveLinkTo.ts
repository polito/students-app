import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

export const resolveLinkTo = (linkTo: To<any>) => ({
  name: typeof linkTo === 'string' ? linkTo : linkTo.screen,
  params:
    typeof linkTo === 'object' && 'params' in linkTo
      ? linkTo.params
      : undefined,
});
