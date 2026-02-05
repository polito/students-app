import { ComponentProps } from 'react';

////import * as Clarity from '@microsoft/react-native-clarity';
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
        /*if (process.env.CLARITY_TEST_PROJECT_ID) {
          Clarity.initialize(process.env.CLARITY_TEST_PROJECT_ID!, {
            logLevel: Clarity.LogLevel.Verbose,
          });
          const currentRouteName = navigationRef.getCurrentRoute()?.name;
          routeNameRef.current = currentRouteName;
          Clarity.setCurrentScreenName('TeachingScreen');
        } else {
          console.warn(
            'No Clarity Project ID provided, skipping Clarity initialization.',
          );
        }*/
      }}
      {...rest}
    >
      {children}
    </ReactNavigationContainer>
  );
};
