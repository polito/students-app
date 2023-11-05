import { VideoLecture } from '@polito/api-client';
import { GetCourseVirtualClassrooms200ResponseDataInner } from '@polito/api-client/models/GetCourseVirtualClassrooms200ResponseDataInner';

export type CourseLecture =
  | GetCourseVirtualClassrooms200ResponseDataInner
  | VideoLecture;

interface BaseLectureTypeSection {
  courseId: number;
  title: string;
  type: 'VirtualClassroom' | 'VideoLecture';
  data: CourseLecture[];
  isExpanded?: boolean;
}

interface VCSection extends BaseLectureTypeSection {
  data: GetCourseVirtualClassrooms200ResponseDataInner[];
  type: 'VirtualClassroom';
}

interface VideoLectureSection extends BaseLectureTypeSection {
  data: VideoLecture[];
  type: 'VideoLecture';
}

export type CourseLectureSection = VCSection | VideoLectureSection;
