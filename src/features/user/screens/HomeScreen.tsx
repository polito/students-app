import { useEffect } from 'react';
import { Button, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as SecureStore from 'expo-secure-store';

import { useQueryClient } from '@tanstack/react-query';

import {
  SECURE_STORE_TOKEN_KEY,
  useApiContext,
} from '../../../core/contexts/ApiContext';
import { useLogout } from '../../../core/queries/authHooks';

export const HomeScreen = () => {
  const { mutate: handleLogout, isLoading, isSuccess } = useLogout();

  const { refreshContext } = useApiContext();
  const client = useQueryClient();

  const onSuccessfulLogout = async () => {
    await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
    await client.invalidateQueries([]);
    refreshContext();
  };

  useEffect(() => {
    if (isSuccess) {
      onSuccessfulLogout().catch(e => {
        // TODO handle error
      });
    }
  }, [isSuccess]);

  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <Button
        title="Logout"
        onPress={() => handleLogout()}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
};
