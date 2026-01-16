import {
  VideoLecture,
  VirtualClassroomLive,
  VirtualClassroomRecording,
  instanceOfVideoLecture,
  instanceOfVirtualClassroomLive,
  instanceOfVirtualClassroomRecording,
} from '@polito/api-client';

import { CourseLecture } from '../types/CourseLectureSections';

export const isLiveVC = (l: CourseLecture): l is VirtualClassroomLive =>
  instanceOfVirtualClassroomLive(l);

export const isRecordedVC = (
  l: CourseLecture,
): l is VirtualClassroomRecording => instanceOfVirtualClassroomRecording(l);

export const isVideoLecture = (l: CourseLecture): l is VideoLecture =>
  instanceOfVideoLecture(l);
