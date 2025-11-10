import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ResponseError } from '@polito/api-client/runtime';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';

import { SQLiteStorage } from 'expo-sqlite/kv-store';
import SuperJSON from 'superjson';

import { updateGlobalApiConfiguration } from '../../config/api';
import { isEnvProduction } from '../../utils/env';
import { getCredentials, resetCredentials } from '../../utils/keychain.ts';
import {
  ApiContext,
  ApiContextProps,
  Credentials,
} from '../contexts/ApiContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useSplashContext } from '../contexts/SplashContext';

export const QueryStorage = new SQLiteStorage('queryClient');

const DATA_MAX_AGE = 1000 * 3600 * 24 * 7;

export const queryPersister = experimental_createQueryPersister({
  storage: QueryStorage,
  serialize: SuperJSON.stringify,
  deserialize: SuperJSON.parse,
  maxAge: DATA_MAX_AGE,
  refetchOnRestore: 'always',
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
  const { username, language } = usePreferencesContext();
  const splashContext = useSplashContext();

  const globalQueryErrorHandler = useCallback(
    async (error: unknown, client: QueryClient) => {
      if (error instanceof ResponseError) {
        if (error.response.status === 401) {
          await resetCredentials();
          setApiContext(c => ({
            ...c,
            isLogged: false,
            username: '',
            token: '',
          }));
          await client.invalidateQueries();
        }
        const { message } = (await error.response.json()) as {
          message?: string;
        };

        // The login alert is handled in the login screen
        if (!error.response.url.includes('/login')) {
          Alert.alert(
            t('common.error'),
            message ?? t('common.somethingWentWrong'),
          );
        }

        if (!isEnvProduction) {
          console.error(message);
          console.error(JSON.stringify(error));
        }
      }
    },
    [t],
  );

  const queryClient = useMemo(() => {
    const client = new QueryClient({
      queryCache: new QueryCache({
        onError: error => {
          if (error instanceof ResponseError) {
            globalQueryErrorHandler(error, client);
          }
        },
      }),
      defaultOptions: {
        queries: {
          gcTime: DATA_MAX_AGE, // 3 days
          staleTime: 300000, // 5 minutes
          networkMode: 'online',
          retry: isEnvProduction ? 2 : 1,
          refetchOnWindowFocus: isEnvProduction,
          persister: queryPersister.persisterFn,
        },
        mutations: {
          retry: 1,
          onError(error) {
            if (error instanceof ResponseError) {
              globalQueryErrorHandler(error, client);
            }
          },
        },
      },
    });
    return client;
  }, [globalQueryErrorHandler]);

  useEffect(() => {
    // Update ApiContext based on the provided token and selected language
    const refreshContext = (credentials?: Credentials) => {
      if (credentials) {
        Sentry.setUser({ username: credentials.username });
      } else {
        Sentry.setUser(null);
      }

      updateGlobalApiConfiguration({
        token: credentials?.token,
        language,
      });

      setApiContext(() => {
        const newContext = {
          isLogged: !!credentials,
          username: credentials?.username ?? '',
          token: credentials?.token ?? '',
          refreshContext,
        };

        return newContext;
      });
    };

    // Retrieve existing token from SecureStore, if any
    getCredentials()
      .then(keychainCredentials => {
        let credentials: Credentials | undefined;

        if (username && keychainCredentials && keychainCredentials.password) {
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
  }, [language, username, queryClient]);

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

  return (
    <ApiContext.Provider value={apiContext}>
      {splashContext.isAppLoaded && (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )}
    </ApiContext.Provider>
  );
};
