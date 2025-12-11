import { ComponentProps, useRef } from 'react';

import {
  NavigationContainer as ReactNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { usePostHog } from 'posthog-react-native';

import { navigationIntegration } from '../../utils/sentry';
import { RootParamList } from '../types/navigation';

export const NavigationContainer = ({
  children,
  ...rest
}: ComponentProps<typeof ReactNavigationContainer>) => {
  const navigationRef = useNavigationContainerRef<RootParamList>();
  const routeNameRef = useRef<string | undefined>(undefined);
  const posthog = usePostHog();

  return (
    <ReactNavigationContainer
      ref={navigationRef as any}
      onReady={() => {
        // Register the navigation container with the instrumentation
        navigationIntegration.registerNavigationContainer(navigationRef);
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName) {
          routeNameRef.current = currentRouteName;
          posthog.capture(currentRouteName || 'unknown_screen');
        }
      }}
      {...rest}
    >
      {children}
    </ReactNavigationContainer>
  );
};
