import { LecturePlace } from '@polito/api-client/models/LecturePlace';

export const resolvePlaceId = (place: LecturePlace) =>
  [place.buildingId, place.floorId, place.roomId].join('-');
