import { useContext } from 'react';
import { Text } from 'react-native';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { DegreeContext } from '../context/DegreeContext';

export const DegreeJobOpportunitiesScreen = () => {
  const degreeId = useContext(DegreeContext);
  const { data } = useGetOfferingDegree({
    degreeId: degreeId,
    year: '2022',
  });

  console.debug('DegreeInfoScreen', data);

  return <Text>{data?.data?.name}</Text>;
};
