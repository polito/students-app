import { CoursesApi } from '@polito-it/api-client';
import { getApiConfiguration } from '../../../config';

export const CourseService = new CoursesApi(getApiConfiguration());
