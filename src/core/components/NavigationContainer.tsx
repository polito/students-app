import { ComponentProps, useRef } from 'react';
import Smartlook, { Properties } from 'react-native-smartlook-analytics';

import {
  NavigationContainer as ReactNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

export const NavigationContainer = ({
  children,
  ...rest
}: ComponentProps<typeof ReactNavigationContainer>) => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();

  const trackScreenView = () => {
    const previousScreen = routeNameRef.current;
    const route = navigationRef.getCurrentRoute();

    if (!route) return;

    const nextScreen = route.name;
    routeNameRef.current = nextScreen;

    if (previousScreen === nextScreen) return;

    const properties = new Properties();
    if (route.params) {
      Object.entries(route.params).forEach(([key, value]) => {
        if (key.endsWith('Id')) {
          properties.putString(key, `${value}`);
        }
      });
    }

    Smartlook.instance.analytics.trackNavigationEnter(nextScreen, properties);
  };

  return (
    <ReactNavigationContainer
      ref={navigationRef}
      onReady={trackScreenView}
      onStateChange={trackScreenView}
      {...rest}
    >
      {children}
    </ReactNavigationContainer>
  );
};
