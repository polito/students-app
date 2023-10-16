import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';

import { ResponseError } from '@polito/api-client/runtime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import SuperJSON from 'superjson';

import { createApiConfiguration } from '../../config/api';
import {
  ApiContext,
  ApiContextProps,
  Credentials,
} from '../contexts/ApiContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useSplashContext } from '../contexts/SplashContext';

export const asyncStoragePersister = createAsyncStoragePersister({
  key: 'polito-students.queries',
  storage: AsyncStorage,
  serialize: SuperJSON.stringify,
  deserialize: SuperJSON.parse,
});

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const [apiContext, setApiContext] = useState<ApiContextProps>({
    isLogged: false,
    username: '',
    token: '',
    refreshContext: () => {},
  });
  const { setFeedback } = useFeedbackContext();
  const { username } = usePreferencesContext();

  const splashContext = useSplashContext();

  useEffect(() => {
    // update ApiContext based on the provided token
    const refreshContext = (credentials?: Credentials) => {
      if (credentials) {
        Sentry.setUser({ username: credentials.username });
      } else {
        Sentry.setUser(null);
      }

      createApiConfiguration(credentials?.token);

      setApiContext(() => {
        return {
          isLogged: !!credentials,
          username: credentials?.username ?? '',
          token: credentials?.token ?? '',
          refreshContext,
        };
      });
    };

    // Retrieve existing token from SecureStore, if any
    Keychain.getGenericPassword()
      .then(keychainCredentials => {
        let credentials = undefined;

        if (username && keychainCredentials) {
          credentials = {
            username: username,
            token: keychainCredentials.password,
          };
        }
        refreshContext(credentials);
      })
      .catch(e => {
        console.warn("Keychain couldn't be accessed!", e);
        refreshContext();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Handle login status
    onlineManager.setEventListener(setOnline => {
      return NetInfo.addEventListener(state => {
        const wasOnline = onlineManager.isOnline();
        if (wasOnline && !state.isConnected) {
          // Phone just went offline
          setOnline(false);
          setFeedback({
            text: t('common.noInternet'),
            isError: true,
            isPersistent: true,
          });
        } else if (!wasOnline && state.isConnected) {
          // Phone is back online
          setOnline(true);
          setFeedback(null);
        }
      });
    });
  }, [setFeedback, t]);

  // Initialization completed, splash can be hidden
  useEffect(() => {
    if (!splashContext.isAppLoaded) {
      splashContext.setIsAppLoaded(true);
    }
  }, [apiContext, splashContext]);

  const isEnvProduction = process.env.NODE_ENV === 'production';

  const queryClient = useMemo(() => {
    const onError = async (error: ResponseError, client: QueryClient) => {
      if (error.response.status === 401) {
        await Keychain.resetGenericPassword();
        setApiContext(c => ({
          ...c,
          isLogged: false,
          username: '',
          token: '',
        }));
        await client.invalidateQueries();
      }
      const { message } = await error.response.json();
      Alert.alert(t('common.error'), message ?? t('common.somethingWentWrong'));
      if (!isEnvProduction) {
        console.error(message);
        console.error(JSON.stringify(error));
      }
    };

    return new QueryClient({
      defaultOptions: {
        queries: {
          cacheTime: 1000 * 60 * 60 * 24 * 3, // 3 days
          staleTime: 300000, // 5 minutes
          // networkMode: 'always',
          retry: isEnvProduction ? 2 : 1,
          refetchOnWindowFocus: isEnvProduction,
          onError(error) {
            if (error instanceof ResponseError) {
              onError(error, queryClient);
            }
          },
        },
        mutations: {
          retry: 1,
          onError(error) {
            if (error instanceof ResponseError) {
              onError(error, queryClient);
            }
          },
        },
      },
    });
  }, [isEnvProduction, t]);

  return (
    <ApiContext.Provider value={apiContext}>
      {splashContext.isAppLoaded && (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            maxAge: Infinity,
          }}
        >
          {children}
        </PersistQueryClientProvider>
      )}
    </ApiContext.Provider>
  );
};
