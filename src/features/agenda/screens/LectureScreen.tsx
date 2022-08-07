import { Text, View } from 'react-native';
import { Link } from '@react-navigation/native';

export const LectureScreen = () => {
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
