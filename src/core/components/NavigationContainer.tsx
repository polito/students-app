import { ComponentProps, useRef } from 'react';

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
  };

  return (
    <ReactNavigationContainer
      ref={navigationRef}
      // onReady={trackScreenView}
      // onStateChange={trackScreenView}
      {...rest}
    >
      {children}
    </ReactNavigationContainer>
  );
};
