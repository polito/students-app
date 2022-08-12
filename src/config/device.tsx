import { Dimensions, Platform } from 'react-native';

export const device = {
  height: Dimensions.get('window').height,
  platform: Platform.OS,
  width: Dimensions.get('window').width,
};
