import { VideoLecture } from '@polito/api-client';
import { instanceOfVideoLecture } from '@polito/api-client/models/VideoLecture';
import {
  VirtualClassroom,
  instanceOfVirtualClassroom,
} from '@polito/api-client/models/VirtualClassroom';
import {
  VirtualClassroomLive,
  instanceOfVirtualClassroomLive,
} from '@polito/api-client/models/VirtualClassroomLive';

export const isLiveVC = (l: object): l is VirtualClassroomLive =>
  instanceOfVirtualClassroomLive(l);

export const isRecordedVC = (l: object): l is VirtualClassroom =>
  instanceOfVirtualClassroom(l);

export const isVideoLecture = (l: object): l is VideoLecture =>
  instanceOfVideoLecture(l);
