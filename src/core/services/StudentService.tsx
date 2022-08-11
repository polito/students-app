import { Configuration, StudentApi } from '@polito-it/api-client';
import { getApiConfiguration } from '../../config';

export const StudentService = new StudentApi(
  new Configuration(getApiConfiguration()),
);
