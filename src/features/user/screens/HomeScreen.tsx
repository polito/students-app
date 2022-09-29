import { Button, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLogout } from '../../../core/queries/authHooks';

export const HomeScreen = () => {
  const { mutate: handleLogout, isLoading } = useLogout();

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
