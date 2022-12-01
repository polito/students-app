import { Button, Text } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApiContext } from '../../../core/contexts/ApiContext';
import { useLogout } from '../../../core/queries/authHooks';

export const HomeScreen = () => {
  const { mutateAsync: handleLogout, isLoading } = useLogout();

  const { refreshContext } = useApiContext();

  const onSuccessfulLogout = async () => {
    await Keychain.resetGenericPassword();
    refreshContext();
  };

  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <Button
        title="Logout"
        onPress={() => handleLogout().then(onSuccessfulLogout)}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
};
