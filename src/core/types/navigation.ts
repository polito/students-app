import { TFunction } from 'react-i18next';

import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Theme } from '@lib/ui/types/Theme';

export type ScreenGroupType<T extends ParamListBase> = {
  Stack: ReturnType<typeof createNativeStackNavigator<T>>;
  theme: Theme;
  t: TFunction<'translation'>;
};
export type NativeStackType<T extends ParamListBase> = ReturnType<
  typeof createNativeStackNavigator<T>
>;
