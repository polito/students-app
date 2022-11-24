import { PropsWithChildren, useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';

import { FetchError } from '@polito/api-client/runtime';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';

import { createApiClients } from '../../config/api';
import { ApiContext, ApiContextProps } from '../contexts/ApiContext';
import { useSplashContext } from '../contexts/SplashContext';

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const [apiContext, setApiContext] = useState<ApiContextProps>({
    isLogged: null,
    token: null,
    refreshContext: null,
    clients: {},
  });

  const splashContext = useSplashContext();

  useEffect(() => {
    // update ApiContext based on the provided token
    const refreshContext = (token?: string) =>
      setApiContext(() => {
        return {
          isLogged: !!token,
          token: token,
          clients: createApiClients(token),
          refreshContext,
        };
      });

    // Retrieve existing token from SecureStore, if any
    Keychain.getGenericPassword()
      .then(credentials => {
        let token = null;
        if (credentials) {
          token = credentials.password;
        }
        refreshContext(token);
      })
      .catch(e => {
        console.warn("Keychain couldn't be accessed!", e);
        refreshContext(null);
      });

    // Handle login status
    onlineManager.setEventListener(setOnline => {
      return NetInfo.addEventListener(state => {
        const wasOnline = onlineManager.isOnline();
        if (wasOnline && !state.isConnected) {
          // Phone just went offline
          setOnline(false);
          // TODO notify
          console.debug('Phone just went offline');
        } else if (!wasOnline && state.isConnected) {
          // Phone is back online
          setOnline(true);
          // TODO notify
          console.debug('Phone is back online');
        }
      });
    });
  }, []);

  // Initialization completed, splash can be hidden
  useEffect(() => {
    if (!splashContext.isAppLoaded) {
      splashContext.setIsAppLoaded(true);
    }
  }, [apiContext]);

  const isEnvProduction = process.env.NODE_ENV === 'production';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: isEnvProduction,
        refetchOnWindowFocus: isEnvProduction,
        onError(error) {
          // TODO notify query error
          if (!isEnvProduction && error instanceof FetchError) {
            console.error(error?.cause?.message ?? error.message);
            console.error(JSON.stringify(error));
          }

          // TODO handle logout on 401
        },
      },
    },
  });

  return (
    <ApiContext.Provider value={apiContext}>
      <QueryClientProvider client={queryClient}>
        {splashContext.isAppLoaded && children}
      </QueryClientProvider>
    </ApiContext.Provider>
  );
};
