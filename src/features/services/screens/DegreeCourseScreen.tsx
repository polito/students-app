import { ScrollView } from 'react-native';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetOfferingCourse } from '../../../core/queries/offeringHooks';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'DegreeCourse'>;

export const DegreeCourseScreen = ({ route }: Props) => {
  const { courseShortcode } = route.params;

  const courseQuery = useGetOfferingCourse({
    courseShortcode,
    year: '2022',
  });

  console.debug('courseQuery', courseQuery.data?.data);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[courseQuery]} manual />}
    >
      {courseQuery.data?.data?.name}
    </ScrollView>
  );
};
