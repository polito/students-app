import { StudentApi } from '@polito-it/api-client';
import { getApiConfiguration } from '../../config';

export const StudentService = new StudentApi(getApiConfiguration());
