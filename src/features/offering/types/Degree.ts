import { Degree as ApiDegree } from '@polito/api-client';
import { MenuAction } from '@react-native-menu/menu';

export type Degree = Omit<ApiDegree, 'editions'> & {
  editions: MenuAction[];
};
