import { VideoLecture, VirtualClassroom } from '@polito/api-client';

export type CourseLecture = VirtualClassroom | VideoLecture;

interface BaseLectureTypeSection {
  courseId: number;
  title: string;
  type: 'VirtualClassroom' | 'VideoLecture';
  data: CourseLecture[];
  isExpanded?: boolean;
}

interface VCSection extends BaseLectureTypeSection {
  data: VirtualClassroom[];
  type: 'VirtualClassroom';
}

interface VideoLectureSection extends BaseLectureTypeSection {
  data: VideoLecture[];
  type: 'VideoLecture';
}

export type CourseLectureSection = VCSection | VideoLectureSection;
