import { Text, View } from 'react-native';

import { Link } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route, navigation }: Props) => {
  return (
    <View>
      <Text>Lecture</Text>

      <Link
        to={{
          screen: 'TeachingTab',
          params: {
            screen: 'Course',
          },
        }}
      >
        Material
      </Link>
    </View>
  );
};
