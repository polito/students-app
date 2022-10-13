import { useEffect } from 'react';
import { Button, Text } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../../../core/contexts/ApiContext';
import { useLogout } from '../../../core/queries/authHooks';

export const HomeScreen = () => {
  const { mutate: handleLogout, isLoading, isSuccess } = useLogout();

  const { refreshContext } = useApiContext();
  const client = useQueryClient();

  const onSuccessfulLogout = async () => {
    await Keychain.resetGenericPassword();
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
