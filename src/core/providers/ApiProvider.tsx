import { useEffect, useRef, useState } from 'react';

import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';

import { FetchError } from '@polito-it/api-client/runtime';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';

import { createApiClients } from '../../config/api';
import {
  ApiContext,
  ApiContextProps,
  SECURE_STORE_TOKEN_KEY,
} from '../contexts/ApiContext';

export const ApiProvider = ({ children }) => {
  const [apiContext, setApiContext] = useState<ApiContextProps>({
    isLogged: null,
    refreshContext: null,
    clients: {},
  });

  const isSplashVisible = useRef<boolean>(true);

  useEffect(() => {
    // update ApiContext based on the provided token
    const refreshContext = (token?: string) =>
      setApiContext(() => {
        return {
          isLogged: !!token,
          clients: createApiClients(token),
          refreshContext,
        };
      });

    // Retrieve existing token from SecureStore, if any
    SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY).then(token => {
      refreshContext(token);
    });

    // Handle login status
    onlineManager.setEventListener(setOnline => {
      return NetInfo.addEventListener(state => {
        const wasOnline = onlineManager.isOnline();
        if (wasOnline && !state.isConnected) {
          // Phone just went offline
          setOnline(false);
          // TODO notify
          console.log('Phone just went offline');
        } else if (!wasOnline && state.isConnected) {
          // Phone is back online
          setOnline(true);
          // TODO notify
          console.log('Phone is back online');
        }
      });
    });
  }, []);

  // Initialization completed, splash can be hidden
  useEffect(() => {
    if (isSplashVisible.current) {
      SplashScreen.hideAsync();
      isSplashVisible.current = false;
    }
  }, [apiContext]);

  const isEnvProduction = process.env.NODE_ENV === 'production';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: isEnvProduction,
        refetchOnWindowFocus: isEnvProduction,
        onError(error: FetchError) {
          // TODO notify query error
          if (!isEnvProduction) {
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
};
