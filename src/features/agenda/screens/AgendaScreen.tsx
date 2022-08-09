import { Text, View } from 'react-native';
import { Link } from '@react-navigation/native';

export const AgendaScreen = () => {
  return (
    <View>
      <Text>Agenda</Text>
      <Link
        to={{
          screen: 'Lecture',
        }}
      >
        Lecture
      </Link>
    </View>
  );
};
