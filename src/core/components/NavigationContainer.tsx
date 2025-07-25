import { ComponentProps } from 'react';

import {
  NavigationContainer as ReactNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { navigationIntegration } from '../../utils/sentry';
import { RootParamList } from '../types/navigation';

export const NavigationContainer = ({
  children,
  ...rest
}: ComponentProps<typeof ReactNavigationContainer>) => {
  const navigationRef = useNavigationContainerRef<RootParamList>();

  return (
    <ReactNavigationContainer
      ref={navigationRef as any}
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
