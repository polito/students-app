import {
  HeaderBackButton,
  HeaderBackButtonProps,
} from '@react-navigation/elements';
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
    return;
  }
  return navigator;
};

export const onCustomBackPressed = (
  navigation: NativeStackNavigationProp<any>,
) => {
  const topStackNavigator = findTopStackNavigator(navigation);
  const navigatorId = topStackNavigator?.getId();

  if (!topStackNavigator) {
    return;
  }

  const tabNavigator = topStackNavigator.getParent()!;

  const isFirstScreenInStack =
    topStackNavigator.getState().routes?.length === 1;

  // console.debug('TAB', JSON.stringify(tabNavigator.getState()));

  const tabNavigatorState = tabNavigator.getState();

  const nextState = {
    ...tabNavigatorState,
    routes: tabNavigatorState.routes.map(tab => {
      // Ignore other tabs
      if (!topStackNavigator.getId()!.startsWith(tab.name)) {
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tabNavigator.reset(nextState);
  tabNavigator.goBack();

  // console.debug('TAB2', JSON.stringify(tabNavigator.getState()));

  if (isFirstScreenInStack) {
    // console.debug('STACK', topStackNavigator.getState());
    topStackNavigator.reset({
      ...topStackNavigator.getState(),
      index: -1,
      routes: [],
    });
    // console.debug('STACK2', topStackNavigator.getState());
  }
};

export const setCustomBackHandler = (
  navigation: NativeStackNavigationProp<any>,
  isCustomBackHandlerEnabled: boolean,
) => {
  navigation.setOptions({
    headerLeft: (props: HeaderBackButtonProps) => (
      <HeaderBackButton
        {...props}
        onPress={
          isCustomBackHandlerEnabled
            ? () => onCustomBackPressed(navigation)
            : props.onPress
        }
      />
    ),
  });
};
