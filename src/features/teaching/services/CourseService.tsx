import { CoursesApi } from '@polito-it/api-client';
import { getApiConfiguration } from '../../../config/api';

export const CourseService = new CoursesApi(getApiConfiguration());
