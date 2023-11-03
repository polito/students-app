import { BackHandler } from 'react-native';

import {
  HeaderBackButton,
  HeaderBackButtonProps,
} from '@react-navigation/elements';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';

export const useCrossTabBack = (
  navigation: NavigationProp<any>,
  isEnabled: boolean = false,
) => {
  useFocusEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () =>
      !isEnabled ? false : onCustomBackPressed(navigation),
    );

    setCustomBackHandler(navigation, isEnabled);

    return () => {
      subscription.remove();
    };
  });
};

const isTabNavigatorId = (id: string | undefined) =>
  id?.toString().endsWith('TabNavigator') === true;

const findTabNavigator = (navigation: NavigationProp<any>) => {
  let navigator = navigation;
  let navigatorId = navigation.getId();

  if (!isTabNavigatorId(navigatorId)) {
    // console.log('NAVIGATOR1', JSON.stringify(navigator));
    do {
      navigator = navigator.getParent();
      navigatorId = navigator?.getId();
      // console.log('NAVIGATOR', navigatorId);
    } while (
      !isTabNavigatorId(navigatorId) ||
      navigator.getParent() !== undefined
    );
  }
  if (!navigator) {
    return;
  }
  return navigator;
};

const onCustomBackPressed = (navigation: NavigationProp<any>) => {
  const tabNavigator = findTabNavigator(navigation);

  if (!tabNavigator) {
    return;
  }

  const navigatorId = tabNavigator.getId();

  const tabsNavigator = tabNavigator.getParent()!;

  const isFirstScreenInStack = tabNavigator.getState().routes?.length === 1;

  console.debug('TAB', JSON.stringify(tabsNavigator.getState()));

  const tabNavigatorState = tabsNavigator.getState();

  const nextState = {
    ...tabNavigatorState,
    routes: tabNavigatorState.routes.map(tab => {
      // Ignore other tabs
      if (!navigatorId?.startsWith(tab.name)) {
        return tab;
      }

      let updatedState = undefined;

      if (tab.state) {
        const updatedStateRoutes = tab.state.routes.slice(0, -1);

        updatedState = {
          ...tab.state,
          index: updatedStateRoutes.length - 1,
          routes: updatedStateRoutes,
        };
      }

      return {
        ...tab,
        params: undefined,
        state: updatedState,
      };
    }),
  };
  // @ts-expect-error reset fails with type mismatch
  tabsNavigator.reset(nextState);
  tabsNavigator.goBack();

  // console.debug('TAB2', JSON.stringify(tabsNavigator.getState()));

  if (isFirstScreenInStack) {
    // console.debug('STACK', tabNavigator.getState());
    tabNavigator.reset({
      ...tabNavigator.getState(),
      index: -1,
      routes: [],
    });
    // console.debug('STACK2', tabNavigator.getState());
  }

  return true;
};

const setCustomBackHandler = (
  navigation: NavigationProp<any>,
  isCustomBackHandlerEnabled: boolean,
) => {
  if (!isCustomBackHandlerEnabled) {
    return;
  }

  navigation.setOptions({
    headerTitleAlign: 'left',
    headerLeft: (props: HeaderBackButtonProps) => (
      <HeaderBackButton
        {...props}
        onPress={() => onCustomBackPressed(navigation)}
        labelVisible={false}
        style={
          {
            // height: 20,
            // width: 20,
            // margin: 0,
            // resizeMode: 'contain',
          }
        }
      />
    ),
  });
};
