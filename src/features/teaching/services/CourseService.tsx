import { Configuration, CoursesApi } from '@polito-it/api-client';

export const CourseService = new CoursesApi(
  new Configuration({
    basePath: 'http://192.168.14.65:4010',
    accessToken: 'whatever',
  }),
);
