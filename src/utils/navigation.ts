import {
  CommonActions,
  NavigationProp,
  NavigationState,
  Route,
} from '@react-navigation/native';

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

export const findRootNavigator = (navigation: NavigationProp<any>) => {
  let navigator = navigation;
  let parentNavigator = navigator.getParent();
  while (parentNavigator) {
    navigator = parentNavigator;
    parentNavigator = navigator.getParent();
  }
  return navigator;
};

/**
 * Resets the navigation state to a specific target route with optional nested routes.
 * This function finds the root navigator and updates the navigation state by replacing
 * the target route's inner state with the provided routes.
 *
 * @param navigation - The navigation prop from React Navigation
 * @param target - The name of the target route to reset to
 * @param targetRoutes - Optional array of routes to set as the inner state of the target route
 * @returns void - Dispatches a reset action to the root navigator
 */
export const resetNavigationStatusTo = (
  navigation: NavigationProp<any>,
  target: Route<string>['name'],
  targetRoutes?: (Omit<NavigationState['routes'][number], 'key'> & {
    key?: string;
  })[],
) => {
  const rootNavigator = findRootNavigator(navigation);
  if (!rootNavigator) return;

  const newRoutes = targetRoutes?.map(route => ({
    ...route,
    key: route.key ?? `${route.name}-${Math.random().toString(36).slice(2, 9)}`,
  }));
  const innerIndex = newRoutes ? newRoutes.length - 1 : -1;

  rootNavigator.dispatch(state => {
    const index = state.routes.findIndex(({ name }) => name === target);
    if (index < 0) return state; // Return current state if target route not found

    const routes = state.routes.map(route =>
      route.name === target
        ? {
            ...route,
            state: {
              ...route.state,
              routes: newRoutes ?? route.state?.routes,
              index: innerIndex >= 0 ? innerIndex : route.state?.index,
            },
          }
        : route,
    );

    return CommonActions.reset({
      ...state,
      index,
      routes,
    });
  });
};
