import { NavigationProp } from '@react-navigation/native';

export const findTabNavigator = (navigation: NavigationProp<any>) => {
  let navigator = navigation;
  let tabFound = false;
  do {
    const parentNavigator = navigator.getParent();
    tabFound = parentNavigator !== undefined && !parentNavigator.getParent();

    if (!tabFound) {
      navigator = parentNavigator!;
    }
  } while (!tabFound);

  if (!tabFound) {
    return;
  }
  return navigator;
};
