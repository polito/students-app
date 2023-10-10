import { ScrollView } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'NewBookingSlotsSelection'
>;

export const NewBookingSlotsSelectionScreen = ({ route }: Props) => {
  const { topicId } = route.params;

  return (
    <ScrollView>
      <Text>{topicId}</Text>
    </ScrollView>
  );
};
