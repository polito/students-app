import { Text } from '@lib/ui/components/Text';

import { useGetOffering } from '../../../core/queries/offeringHooks';

export const OfferingScreen = () => {
  const { data } = useGetOffering();

  console.debug('offering', data);

  return <Text>OfferingScreen</Text>;
};
