import { Platform, TouchableOpacity } from 'react-native';

import { faArrowLeft, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const isTabNavigatorId = (id: string | undefined) =>
  id?.toString().endsWith('TabNavigator') === true;

const findTopStackNavigator = (navigation: NativeStackNavigationProp<any>) => {
  let navigator = navigation;
  let navigatorId = navigation.getId();

  if (!isTabNavigatorId(navigatorId)) {
    do {
      navigator = navigator.getParent();
      navigatorId = navigator?.getId();
    } while (
      !isTabNavigatorId(navigatorId) ||
      navigation.getParent() === undefined
    );
  }
  if (!navigator) {
    console.error('No navigator found');
    return;
  }
  return navigator;
};

export const onCustomBackPressed = (
  navigation: NativeStackNavigationProp<any>,
) => {
  const navigator = findTopStackNavigator(navigation);
  const navigatorId = navigator?.getId();

  if (!navigator) {
    return;
  }

  const isFirstScreenInStack = navigator.getState().routes?.length === 1;

  if (isFirstScreenInStack) {
    let initialScreenName = undefined;
    switch (navigatorId) {
      case 'TeachingTabNavigator':
      case 'ServicesTabNavigator':
        initialScreenName = 'Home';
        break;
      case 'AgendaTabNavigator':
        initialScreenName = 'Agenda';
        break;
      case 'PlacesTabNavigator':
        initialScreenName = 'Places';
        break;
      case 'UserTabNavigator':
        initialScreenName = 'Profile';
        break;
      default:
        console.error('No initial screen name for navigatorId', navigatorId);
        return;
    }

    navigator!.reset({
      index: 0,
      routes: [{ name: initialScreenName }],
    });
  } else {
    navigator!.pop();
  }

  navigator.getParent()!.goBack();
};

export const setCustomBackHandler = (
  navigation: NativeStackNavigationProp<any>,
  isCustomBackHandlerEnabled: boolean,
) => {
  const icon = Platform.select({
    ios: faChevronLeft,
    android: faArrowLeft,
  })!;

  if (!isCustomBackHandlerEnabled) {
    return;
  }

  navigation.setOptions({
    headerLeft: () => (
      <TouchableOpacity onPress={() => onCustomBackPressed(navigation)}>
        <Icon icon={icon} size={18} color="red" />
      </TouchableOpacity>
    ),
  });
};
