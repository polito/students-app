import { LecturesApi } from '@polito/api-client';

import { Lecture } from '../types/Lecture';

export class LecturesApiExtended extends LecturesApi {
  async getNextLecture(courseId: number): Promise<Lecture | undefined> {
    const response = await this.request({
      path: `/courses/${courseId}/nextLecture`,
      method: 'GET',
      headers: {},
    });
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error('Failed to fetch next lecture');
    const json: any = await response.json();
    const lecture = json.data;
    return {
      ...lecture,
      startsAt: new Date(lecture.startsAt),
      endsAt: new Date(lecture.endsAt),
    };
  }
}
