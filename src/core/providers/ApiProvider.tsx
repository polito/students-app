import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import * as Keychain from 'react-native-keychain';

import { FetchError } from '@polito-it/api-client/runtime';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';

import { createApiClients } from '../../config/api';
import { ApiContext, ApiContextProps } from '../contexts/ApiContext';

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const [apiContext, setApiContext] = useState<ApiContextProps>({
    isLogged: null,
    refreshContext: null,
    clients: {},
  });

  const apiInitialized = useRef<boolean>(false);

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
    Keychain.getGenericPassword()
      .then(credentials => {
        let token = null;
        if (credentials) {
          token = credentials.password;
        }
        refreshContext(token);
      })
      .catch(e => {
        console.log("Keychain couldn't be accessed!", e);
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
    if (!apiInitialized.current) {
      apiInitialized.current = true;
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
        {apiInitialized.current && children}
      </QueryClientProvider>
    </ApiContext.Provider>
  );
};
