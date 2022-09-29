import React from 'react';
import { View } from 'react-native';
import { VideoPlayer } from '@lib/ui/components/VideoPlayer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { useGetCourseVideolectures } from '../hooks/courseHooks';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVideolecture'
>;

export const CourseVideolectureScreen = ({ route }: Props) => {
  const { courseId, lectureId } = route.params;

  const { data: videolecturesResponse } = useGetCourseVideolectures(courseId);

  const lecture = videolecturesResponse?.data.find(l => l.id === lectureId);
  return (
    <View>
      <VideoPlayer
        videoUrl="https://lucapezzolla.com/20210525.mp4"
        coverUrl={lecture.coverUrl}
      />
    </View>
  );
};
