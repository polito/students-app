import { ExamsApi } from '@polito-it/api-client';
import { getApiConfiguration } from '../../../config';

export const ExamService = new ExamsApi(getApiConfiguration());
