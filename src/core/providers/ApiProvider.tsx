import { PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';

import { ResponseError } from '@polito/api-client/runtime';
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
  Credentials,
} from '../contexts/ApiContext';
import { useSplashContext } from '../contexts/SplashContext';

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const [apiContext, setApiContext] = useState<ApiContextProps>({
    isLogged: null,
    refreshContext: null,
    clients: {},
  });

  const splashContext = useSplashContext();

  useEffect(() => {
    // update ApiContext based on the provided token
    const refreshContext = (credentials?: Credentials) =>
      setApiContext(() => {
        return {
          isLogged: !!credentials,
          ...credentials,
          clients: createApiClients(credentials?.token),
          refreshContext,
        };
      });

    // Retrieve existing token from SecureStore, if any
    Keychain.getGenericPassword()
      .then(keychainCredentials => {
        let credentials = null;
        if (keychainCredentials) {
          credentials = {
            username: keychainCredentials.username,
            token: keychainCredentials.password,
          };
        }
        refreshContext(credentials);
      })
      .catch(e => {
        console.warn("Keychain couldn't be accessed!", e);
        refreshContext();
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

  const onError = async (error: ResponseError, client: QueryClient) => {
    if (error.response.status === -401) {
      setApiContext(c => ({
        ...c,
        isLogged: false,
        token: null,
      }));
      client.invalidateQueries();
    }
    const { message } = await error.response.json();
    Alert.alert(t('common.error'), message ?? t('common.somethingWentWrong'));
    if (!isEnvProduction) {
      console.error(message);
      console.error(JSON.stringify(error));
    }
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: isEnvProduction && 2,
        refetchOnWindowFocus: isEnvProduction,
        onError(error) {
          if (error instanceof ResponseError) {
            onError(error, queryClient);
          }
        },
      },
      mutations: {
        onError(error) {
          if (error instanceof ResponseError) {
            onError(error, queryClient);
          }
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
