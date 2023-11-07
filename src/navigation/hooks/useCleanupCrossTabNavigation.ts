import { NavigationProp, useFocusEffect } from '@react-navigation/native';

import { findTabNavigator } from '../../utils/navigation';

export const useCleanupCrossTabNavigation = (
  navigation: NavigationProp<any>,
) => {
  useFocusEffect(() => {
    const tabNavigator = findTabNavigator(navigation)!;
    const tabState = tabNavigator.getState();

    if ((tabState.routes?.length ?? 2) > 1) {
      return;
    }

    const rootNavigator = tabNavigator.getParent()!;
    const previousState = rootNavigator.getState();

    const tabStateInRoot = previousState.routes.find(route =>
      tabNavigator.getId()?.startsWith(route.name),
    );

    if (tabStateInRoot?.params === undefined) {
      return;
    }

    const nextState = {
      ...previousState,
      routes: previousState.routes.map(route => {
        if (!tabNavigator.getId()?.startsWith(route.name)) {
          return route;
        }

        return {
          ...route,
          params: undefined,
        };
      }),
    };

    rootNavigator.reset(nextState);
  });
};
