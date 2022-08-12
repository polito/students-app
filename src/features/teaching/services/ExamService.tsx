import { ExamsApi } from '@polito-it/api-client';
import { getApiConfiguration } from '../../../config/api';

export const ExamService = new ExamsApi(getApiConfiguration());
