import { Configuration, ExamsApi } from '@polito-it/api-client';

export const ExamService = new ExamsApi(
  new Configuration({
    basePath: 'http://192.168.14.65:4010',
    accessToken: 'whatever',
  }),
);
