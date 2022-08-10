import { Configuration, StudentApi } from '@polito-it/api-client';

export const StudentService = new StudentApi(
  new Configuration({
    basePath: 'http://192.168.14.65:4010',
    accessToken: 'whatever',
  }),
);
