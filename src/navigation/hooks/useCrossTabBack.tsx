import { BackHandler, Platform } from 'react-native';

import {
  HeaderBackButton,
  HeaderBackButtonProps,
} from '@react-navigation/elements';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';

import { findTabNavigator } from '../../utils/navigation';

/**
 * Hook to enable cross tab back navigation
 *
 * @param navigation
 * @param isEnabled
 */
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

/**
 * Find the nearest tab navigator up the tree
 *
 * @param navigation
 */

const onCustomBackPressed = (navigation: NavigationProp<any>) => {
  const tabNavigator = findTabNavigator(navigation);

  if (!tabNavigator) {
    return;
  }

  const navigatorId = tabNavigator.getId();

  const tabsNavigator = tabNavigator.getParent()!;

  const isFirstScreenInStack = tabNavigator.getState().routes?.length === 1;

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
    headerBackVisible: false,
    headerTitleAlign: 'left',
    headerLeft: (props: HeaderBackButtonProps) => (
      <HeaderBackButton
        {...props}
        labelVisible={false}
        onPress={() => onCustomBackPressed(navigation)}
        style={Platform.select({
          ios: {
            marginHorizontal: -9.5,
            left: -7,
          },
          android: { left: -15, marginHorizontal: 14 },
        })}
      />
    ),
  });
};
