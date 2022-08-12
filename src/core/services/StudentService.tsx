import { StudentApi } from '@polito-it/api-client';
import { getApiConfiguration } from '../../config/api';

export const StudentService = new StudentApi(getApiConfiguration());
