import { useContext } from 'react';
import { Text } from 'react-native';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { DegreeContext } from '../context/DegreeContext';

export const DegreeTracksScreen = () => {
  const { degreeId, year } = useContext(DegreeContext);
  const { data } = useGetOfferingDegree({
    degreeId: degreeId as string,
    year: year,
  });

  console.debug('DegreeInfoScreen', data);

  return <Text>{data?.data?.name}</Text>;
};
