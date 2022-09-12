import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { ResizeMode } from 'expo-av';
import VideoPlayer from 'expo-video-player';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { useGetCourseVirtualClassrooms } from '../hooks/courseHooks';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVirtualClassroom'
>;

export const CourseVirtualClassroomScreen = ({ route }: Props) => {
  const { courseId, lectureId } = route.params;

  const { data: virtualClassroomsResponse } =
    useGetCourseVirtualClassrooms(courseId);

  const lecture = virtualClassroomsResponse?.data.find(l => l.id === lectureId);
  const { width } = Dimensions.get('window');
  const { colors } = useTheme();

  return (
    <View>
      <VideoPlayer
        defaultControlsVisible={true}
        header={
          <Text style={{ color: '#FFF' }}>Custom controls will go up here</Text>
        }
        slider={{
          thumbTintColor: colors.secondary[600],
          minimumTrackTintColor: colors.secondary[600],
          maximumTrackTintColor: colors.background,
        }}
        style={{
          height: (width / 16) * 9,
          controlsBackgroundColor: colors.heading,
        }}
        videoProps={{
          resizeMode: ResizeMode.CONTAIN,
          posterSource: {
            uri: lecture.coverUrl,
          },
          source: {
            uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
          },
          status: {
            rate: 2,
          },
        }}
      />

      <Text>{lecture && JSON.stringify(lecture)}</Text>
    </View>
  );
};
