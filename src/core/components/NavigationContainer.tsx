import { ComponentProps } from 'react';

import {
  NavigationContainer as ReactNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { routingInstrumentation } from '../../utils/sentry';

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
        routingInstrumentation.registerNavigationContainer(navigationRef);
      }}
      {...rest}
    >
      {children}
    </ReactNavigationContainer>
  );
};
