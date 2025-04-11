import { ComponentProps } from 'react';

import {
  NavigationContainer as ReactNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { navigationIntegration } from '../../utils/sentry';

export const NavigationContainer = ({
  children,
  ...rest
}: ComponentProps<typeof ReactNavigationContainer>) => {
  const navigationRef = useNavigationContainerRef();

  return (
    <ReactNavigationContainer
      ref={navigationRef}
      onReady={() => {
        // Register the navigation container with the instrumentation
        navigationIntegration.registerNavigationContainer(navigationRef);
      }}
      {...rest}
    >
      {children}
    </ReactNavigationContainer>
  );
};
