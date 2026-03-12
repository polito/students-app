import { Degree as ApiDegree } from '@polito/student-api-client';
import { MenuAction } from '@react-native-menu/menu';

export type Degree = Omit<ApiDegree, 'editions'> & {
  editions: MenuAction[];
};
