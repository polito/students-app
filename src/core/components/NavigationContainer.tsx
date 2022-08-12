import { ComponentProps, useRef } from 'react';
import {
  NavigationContainer as ReactNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  useTrackAppStartAsync,
  useTrackScreenViewAsync,
} from '../hooks/matomoHooks';

export const NavigationContainer = ({
  children,
  ...props
}: ComponentProps<typeof ReactNavigationContainer>) => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();

  const trackAppStart = useTrackAppStartAsync();
  const trackScreenView = useTrackScreenViewAsync();

  const getCurrentRouteName = () => {
    const route = navigationRef.getCurrentRoute();
    console.log(route.params);

    type ParamsWithId = {
      id: string | number;
    };

    const id = (route.params as ParamsWithId)?.id;

    if (id) {
      return `${route.name} / ${id}`;
    }

    return route.name;
  };

  return (
    <ReactNavigationContainer
      ref={navigationRef}
      onReady={() => {
        const currentRouteName = getCurrentRouteName();
        routeNameRef.current = currentRouteName;
        trackAppStart();
        trackScreenView(currentRouteName);
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = getCurrentRouteName();

        if (previousRouteName !== currentRouteName) {
          trackScreenView(currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}
      {...props}
    >
      {children}
    </ReactNavigationContainer>
  );
};
